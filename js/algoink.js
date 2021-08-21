

//Globals
var permalink, hash, menuOpen = false, debug = false, highlight = true, htmlEditor;
var savedIframe, skName=undefined, editorOpen=undefined;
var inGallery = false;
var title = "Title";
var author = "Author";
var sketch = "";
const skDir = "/saves/";
var skDefault = {
	name: "2ed9f913",
	sketch: "  startshape c \n \
               rule c{  \n \
                  CIRCLE{ s 0.4 }  \n \
                }  \n \
                "
    }

 
function saveServerOnline() {
   try {
      $.get("http://localhost:9000/", function(data, status){
        var x = document.getElementById('save-status');
        if (x.style.display === 'block') {
            x.style.display = 'none';
            x = document.getElementById('save-id');
            x.style.display = 'block';
            console.log('Save Server online!!');
          }
       // alert("Data: " + data + "\nStatus: " + status);   
       })
       .catch(error => {
          var x = document.getElementById('save-id');
          x.style.display = 'none';
          x = document.getElementById('save-status');
          x.style.display = 'block';
          console.log('Check Save Server connection. May be its not started yet. Try "$>python ./server.py"');
          return(false);
        });
      }catch(e){
          console.log('catch', e);
          return(false);
      }
      return(true);

}

//Init
$(function(){
  
  hash = window.location.toString().split("/");
  hash = hash[3];

  skName = GetURLParameter('sketch');
  // console.log(skName);

  if (typeof skName == 'undefined'){
     skName = skDefault.name;
  }


  saveServerOnline();

  

  editorOpen = GetURLParameter('editor');
 
  if ((typeof editorOpen === 'undefined') || (editorOpen === "true")){
     if($(".toggleLink").data("state") !== "open"){
        showCode();
     }
  }else{
        hideCode();
  }

  	
  savedIframe = $('#skCanvas').html();

  var skFile = skDir+skName+".txt";
	//console.log(skFile);
  jQuery.get(skFile, function(data) {
 //console.log(data);
  darr = data.split("&");
  title = darr[1];
  author = darr[0];
  sketch = darr[2];
  loadSketch(title, author, sketch);
 });
  
  


  $.support.flash = true;
  $.support.highlighting = true;
  enableHighlighting();
 
  

  //map events
  mapEvents();
  


 /********************** TOGGLE/MENU SELECTION ACTION  **********************/ 
 // set up toggle for code sidebar
  
  $(".toggleLink").data("state", "open").click(function(){
    if($(this).data("state") == "open"){
      hideCode();
    }else{
      showCode();
    }
    return false;
  });
 

  function showCover() {
      let coverDiv = document.createElement('div');
      coverDiv.id = 'cover-div';

      // make the page unscrollable while the modal form is open
      document.body.style.overflowY = 'hidden';

      document.body.append(coverDiv);
    }

    function hideCover() {
      document.getElementById('cover-div').remove();
      document.body.style.overflowY = '';
    }


  function showPrompt(text, callback) {
      showCover();
      let form = document.getElementById('prompt-form');
      let container = document.getElementById('prompt-form-container');
      form.skName.value = 'Sketch Name';
      form.skTitle.value = 'Sketch Title';
      form.skAuthor.value = 'Author';

      function complete(skNamevalue, skTitlevalue="Title", skAuthorvalue="Author") {
        hideCover();
        container.style.display = 'none';
        document.onkeydown = null;
        callback(skNamevalue, skTitlevalue, skAuthorvalue);
      }

      form.onsubmit = function() {

        if (form.skName.value == '') return false; // ignore empty submit
        
        complete(form.skName.value, form.skTitle.value, form.skAuthor.value);
        return false;
      };

      form.cancel.onclick = function() {
        complete(null, null, null);
      };

      document.onkeydown = function(e) {
        if (e.key == 'Escape') {
          complete(null, null, null);
        }
      };

      let lastElem = form.elements[form.elements.length - 1];
      let firstElem = form.elements[0];

      lastElem.onkeydown = function(e) {
        if (e.key == 'Tab' && !e.shiftKey) {
          firstElem.focus();
          return false;
        }
      };

      firstElem.onkeydown = function(e) {
        if (e.key == 'Tab' && e.shiftKey) {
          lastElem.focus();
          return false;
        }
      };

      container.style.display = 'block';
      form.elements.skName.focus();
    }

   $("li.new a").click(function(){
    showPrompt("Enter new sketch info", function(skNamevalue, skTitlevalue, skAuthorvalue) {
          if(skNamevalue != null){
              title = skTitlevalue;
              skName = skNamevalue;
              author = skAuthorvalue;

              var sktitle = ' &#6158;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#6158;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
                "'+title+'" <span style="text-transform: lowercase; color:yellow;">by</span> '+ author;


              $('#sktitle').html(sktitle);
              document.getElementById('skname').value = skName;
              

                //alert("You entered: " + skNamevalue + ":" + skTitlevalue + ":" + skAuthorvalue);
          }
      });
    return false;
  });

  $("li.refresh a").click(function(){
  	//console.log("Refresh clicked\n");
    saveServerOnline();

  	if(!inGallery){
     //var surl = "index.html?sketch="+skName+"&editor="+editorOpen;
     //console.log(surl);
     //window.open(surl,"_PARENT");
     push();
    }
    return false;
  });

  $("li.open a").click(function(){
  	//console.log("Refresh clicked\n");
  	if(!inGallery){
        openGallery();
    }
    return false;
  });


$("li.download a").click(function(){
	var skSave = highlight ? htmlEditor.getSession().getValue() : $("#sketch").val();
	skSave = author +"\&"+title+"\&"+ skSave;
	//console.log(author,title, skSave);
  	downloadSketch(skName, skSave);
    return false;
  });


$("li.fullscreen a").click(function(){
  var skSave = highlight ? htmlEditor.getSession().getValue() : $("#sketch").val();
  skSave = author +"\&"+title+"\&"+ skSave;
  //console.log(author,title, skSave);
    openSketchFullScreen(skName, skSave);
    return false;
  });


$("li.save a").click(function(){
   if(saveServerOnline() === true){
      var skSave = highlight ? htmlEditor.getSession().getValue() : $("#sketch").val();
      skSave = author +"\&"+title+"\&"+ skSave;
      //console.log(author,title, skSave);

      var now = new Date();
      // Create formatted time
      var yyyy = now.getFullYear();
      var mm = now.getMonth() < 9 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1); // getMonth() is zero-based
      var dd  = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();
      var hh = now.getHours() < 10 ? "0" + now.getHours() : now.getHours();
      var mn  = now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();
      var ss  = now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds();


      var timestamp = '-'+yyyy+mm+dd+'T'+ hh+mn+ss;

      skName = document.getElementById('skname').value.split('-')[0] +timestamp;
      document.getElementById('skname').value = skName;

      saveSketch(skName, skSave);
      return false; 
    }

  });


/********************** MENU SELECTION ACTION  **********************/ 
  
  var tt;
  
  $("nav li").hover(function(){
    clearTimeout(tt);
    var m;
    m = $(this).find(".tooltip");
    tt = setTimeout(function(){
      showTooltip(m);
    }, 500);
  }, function(){
    clearTimeout(tt);
    var m;
    m = $(this).find(".tooltip");
    hideTooltip(m);
  });
  
  
  
  $.mapKey("`", toggleDrawer);
  
 
  
  $.preload([
            "images/nav-divider.png",  
            "images/sprite-toggle.png", 
            ]);
});




//hide code sidebar
function hideCode(){
  var $c = $("#controls");
  var $d = $("#skCanvas");
  var w = $c.width();
  $c.animate({left: "-"+w+"px"}, "easeOutQuad", function(){
   $(".toggleLink").data("state", "closed").text('»').toggleClass("collapsed");
  });
  $d.animate({left: 0}, "easeOutQuad");
  editorOpen = false;
}

//show code sidebar
function showCode(){
  var  $c = $("#controls"), 
      $d = $("#skCanvas"), 
      w = $c.width();

  $c.animate({left: 0}, "easeInQuad", function(){
    $(".toggleLink").data("state", "open").text('«').toggleClass("collapsed");
  });
  $d.animate({left: w+'px'}, "easeInQuad");
  editorOpen = true;
}



/********************************** LOAD SKETCH **********************************/

//push code to iframe
function push(){

//	$('#skCanvas').html(savedIframe);
 // Update HTML of #skCanvas
  html = highlight ? htmlEditor.getSession().getValue() : $("#sketch").val();
  //console.log("TODO: pushing...");

  //console.log(html);

  var theId = "sketchId"; 
  var sketchTxt = $("#"+theId); 


  sketchTxt.text(html);
  display( theId );
  
  saveState(html);
  savedIframe = $('#skCanvas').html();
}


/********************************** EDITOR **********************************/

function enableHighlighting(){


  htmlEditor = ace.edit("sketch");
  htmlEditor.setTheme("ace/theme/monokai");
  htmlEditor.session.setMode("ace/mode/html");

  
  htmlEditor.getSession().setTabSize(2);
  
}



/********************************** EVENTS **********************************/


function mapEvents(){
  
  //push on keydown for live updates
  htmlEditor.getSession().on('change', function(){
    clearTimeout(t);
    var t = setTimeout(push, 200);
  });
  
}


/********************************** DRAWER / TOOLTIP **********************************/

function toggleDrawer(){
  if($(".toggleLink").data("state") == "open"){
    hideCode();
  }else{
    showCode();
  }
}


function showTooltip(el){
  if(!menuOpen){
    $e = $(el);
    $e.css("opacity", "0").css("top", "45px").css("display", "block");
    $e.animate({opacity: 1, top: "40px"});
  }
}

function hideTooltip(el){
  $e = $(el);
  $e.animate({opacity: 0, top: "35px"});
  $e.css("display", "none");
}

/********************************** GALLERY **********************************/
function openGallery(){
  var $frame;
  //create an iframe element
  $frame = $('<iframe id="frame" src="/saves/gallery.html">');
  $frame.addClass($("#swatches").attr("class"));
  //append the iframe to #skCanvas
  //console.log($('#skCanvas').html);
  savedIframe = $('#skCanvas').html();
  $('#skCanvas').html($frame);

  
  //set up our variables so we can edit it
  setTimeout( function() { 
      var doc = $frame[0].contentWindow.document; 
      var $body = $('body', doc);
      var $head = $('head', doc);
      var $style = $style = $("<style type='text/css'/>");
      $style[0].type = "text/css";
      $head.append($style);
  }, 1 );

  inGallery = true;
  
}


/********************************** LOAD / SAVE / RESET **********************************/
// reset sketch to default circle sketch
function resetCode(){
     var surl = "?sketch="+skDefault.name;
     window.open(surl,"_PARENT");
}


function loadSketch(title, author, sketch){
  var sktitle = ' &#6158;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#6158;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
        "'+title+'" <span style="text-transform: lowercase; color:yellow;">by</span> '+ author;


  $('#sktitle').html(sktitle);
  document.getElementById('skname').value = skName;

  htmlEditor.getSession().setValue(sketch);
  savedIframe = $('#skCanvas').html();
  push();

}


// Save sketch to jStorage
function saveState(html){
  $.jStorage.set('html', html);
}

// Load sketch from jStorage
function loadState(){
  if($.jStorage.get('html')){
    $("#sketch").text($.jStorage.get('html'));
  }
}



/********************************** UTILITIES **********************************/
// read URL input parameters
function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}





