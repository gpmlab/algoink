#!/usr/bin/python

from os import curdir
from os.path import join as pjoin

from http.server import BaseHTTPRequestHandler, HTTPServer

import base64
from json import dumps, loads

class RequestHandler(BaseHTTPRequestHandler):

    def _send_cors_headers(self):
      """ Sets headers required for CORS """
      self.send_header("Access-Control-Allow-Origin", "*")
      self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
      self.send_header("Access-Control-Allow-Headers", "x-api-key,Content-Type")

    def send_dict_response(self, d):
      """ Sends a dictionary (JSON) back to the client """
      self.wfile.write(bytes(dumps(d)))

    def do_OPTIONS(self):
      self.send_response(200)
      self._send_cors_headers()
      self.end_headers()

    def do_GET(self):
      self.send_response(200)
      self._send_cors_headers()
      self.end_headers()

      response = {}
      response["status"] = "OK"
      self.send_dict_response(response)

    def do_POST(self):
      self.send_response(200)
      self._send_cors_headers()
      self.send_header("Content-Type", "application/json")
      self.end_headers()

      dataLength = int(self.headers["Content-Length"])
      data = self.rfile.read(dataLength).decode('utf-8')
      skDict = loads(data)
      skName = skDict["skName"]
      skThumb = skDict["skThumb"]
      sketch = skDict["sketch"]

      image_64_decode = base64.b64decode(skThumb) 
      skThumb_path = pjoin(curdir+"/draft/", skName+".png")
      sketch_path = pjoin(curdir+"/draft/", skName+".txt")
        
      with open(skThumb_path, 'wb') as fh:
          fh.write(image_64_decode)

      with open(sketch_path, 'w') as fh:
          fh.write(sketch)

      response = {}
      response["status"] = "OK"
      self.send_dict_response(response)

print("Starting server")
httpd = HTTPServer(("127.0.0.1", 9000), RequestHandler)
print("Hosting server on port 9000")
httpd.serve_forever()

