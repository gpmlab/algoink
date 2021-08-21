#!/bin/bash

ROOT=$PWD
HTTP="/"
OUTPUT="index.html" 

i=0
echo "<UL>" > $OUTPUT
for filepath in `find "$ROOT" -maxdepth 1 -mindepth 1 -type f|grep "\.png"|sort`; do
  file=`basename "$filepath"`
  echo '<li><a href="'$file'">'$file'</a></li>' >>  $OUTPUT
done
echo "</UL>" >> $OUTPUT
