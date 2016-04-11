// Load core node.js libraries
var https = require("https");
var http = require("http");
var fs = require("fs");
var qs = require("querystring");
var crypto = require("crypto");

// Load our custom libraries
var routes = require("./lib/routes.js");

// Configuration
var ports = {
  "http":   80,
  "https": 443
};

/*
// Local settings that I _should_ remember to delete before submitting, since
// my Linux box is set up for nginx + php5-fpm so ports 80 & 443 are in use:
ports['http'] = 8888;
ports['https'] = 8443;
*/

// Used in lib/configurations.js
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// Begin the HTTPS Server
var options = {
  key: fs.readFileSync("ssl/private-key.pem"),
  cert: fs.readFileSync("ssl/cert.pem")
};
https.createServer(options, function(request, response) {
  if (request.method == 'POST') {
      var body = '';
      request.on('data', function (data) {
          body += data;
          if (body.length > 1e8) {
            // 100 MB is a  bit much
            request.connection.destroy();
          }
      });
      request.on('end', function () {
          request.POST = qs.parse(body);
          // use POST
          return routes.route(request, response);
      });
  } else {
    request.POST = {};
    return routes.route(request, response);
  }
}).listen(ports["https"]);

// HTTPS only! Redirect HTTP requests to use HTTPS instead.
http.createServer(function(request, response) {
  var host = request.headers.host.match(/:/g)
    ? request.headers.host.slice(0, request.headers.host.indexOf(':'))
    : request.headers.host;

  // Non-standard port? No problem!
  if (ports["https"] !== 443) {
    host += ":" + ports["https"];
  }

  response.writeHead(301, {
    "Location": "https://" + host + request.url
  });
  response.end();
}).listen(ports["http"]);
