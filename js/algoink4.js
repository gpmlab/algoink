var canvas;


function display( id ){
// We need to unescape the id because it is coming in via the hash, and
// URL can have weird encodings (i.e., "%20" instead of " ").
var theId = unescape(id);

//console.log("TODO: ", theId, id);
var t = new Tokenizer();
var tokens = t.tokenize( theId );

var c = new Compiler();
var compiled = c.compile( tokens );


canvas = document.createElement( "canvas" );
var container = $("#canvasContainer");
canvas.width = container.width();
canvas.height = container.height();
canvas.id = "theCanvas";

$(container).find("#theCanvas").remove();
$(container).append( canvas );

var r = Renderer;
r.render( compiled, "theCanvas" );
}  


 var html1 = '<html><head><title>ContextFree.js</title></head><body><script src="/js/contextfree.js"></script> </script><script src="/js/jquery-3.6.0.min.js"></script><script>function display( id ){var theId = unescape(id);var t = new Tokenizer();var tokens = t.tokenize( theId );\
var c = new Compiler();var compiled = c.compile( tokens );var canvas = document.createElement( "canvas" );\
var container = $("#canvasContainer");canvas.width = container.width();canvas.height = container.height();\
canvas.id = "theCanvas";$(container).find("#theCanvas").remove();$(container).append( canvas );\
var r = Renderer; r.render( compiled, "theCanvas" );}</script><div id="canvasContainer" style="width:100%;height:100%;"></div>\
<textarea id="sketch" style="display:none">';
var html2 = '</textarea><script>var theId = "sketch"; display( theId );</script></body></html>';


function downloadSketch(skName, sketch){
  	var zip = new JSZip();         

    //skip this step if you don't want your files in a folder.
    var folder = zip.folder(skName);
    var arrSk = sketch.split('&');
    var html = html1 + arrSk[2] + html2;
    folder.file(skName+".txt", sketch); 
    folder.file(skName+".html", html); 
    var img = canvas.toDataURL("image/png");

    folder.file(skName+".png", img.split('base64,')[1],{base64: true});

    zip.generateAsync({type:"blob"})
               .then(function(content) {
                //see FileSaver.js
                saveAs(content, skName+".zip");
      });


}

/* Start server to save sketch:
   $> python ./server
*/

function saveSketch(skName, sketch){
    var img = canvas.toDataURL("image/png");
    $.post("http://localhost:9000/", JSON.stringify({"skName":skName, "skThumb":img.split('base64,')[1], "sketch":sketch}) );
}



function openSketchFullScreen(skName, sketch){
    var arrSk = sketch.split('&');
    var html = html1 + arrSk[2] + html2;
    console.log(html);
    var newWin = open('url',"_PARENT");
    //newWin.document.URL = newWin.document.URL+"?sketch=skName";
    newWin.document.location = newWin.document.location+"?sketch=skName";
    newWin.document.write(html);

   }

