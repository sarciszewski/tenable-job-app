var cookies = require("../lib/cookies.js");
var session = require("../lib/session.js");
var secure = require("../lib/secure.js");

(function () {
  var _self = this;
  this.request = {};

  /**
   * Checks that the POST CSRF token matches the HTTP cookie value
   *
   * @return boolean
   */
  this.checkCSRF = function() {
    if (typeof(_self.request.cookie_data["csrf_token"]) === "undefined") {
      return false;
    }
    if (typeof(_self.request.POST["csrf_token"]) === "undefined") {
      return false;
    }

    return secure.hash_equals(
      new Buffer(_self.request.POST["csrf_token"]),
      new Buffer(_self.request.cookie_data["csrf_token"])
    );
  };

  this.handlers = {
    /**
     * Log in to a user account
     */
    "login": function() {
      if (typeof(_self.request.session_data) === "undefined") {
        _self.request.session_data = {};
      }
      var user = require("../lib/users.js");
      if (typeof(_self.request.POST.username) !== "undefined" && typeof(_self.request.POST.password) !== "undefined") {
        var auth_user = user.authenticate(
          _self.request.POST.username,
          _self.request.POST.password
        );
        if (auth_user !== false) {
          _self.request.session_data.userid = auth_user.id;
          return _self.handlers.default(request);
        }
      }
      return _self.handlers.default(request);
    },

    /**
     * End the current session, wipe the cookie
     */
    "logout": function() {
      session.destroy(_self.request.session_id);
      delete _self.request.cookie_data['session_id'];
      return JSON.stringify({
        "message": "You have been logged out!"
      })
    },

    /**
     * Configuration handler!
     *
     * @url /configurations/*
     */
    "handleConfig": function (action, name) {
      var cf = require("../lib/configurations.js");
      _self.request.send_headers["Content-Type"] = "application/json";

      if (typeof(_self.request.session_data) !== "undefined") {
        if (typeof(_self.request.session_data.userid) !== "undefined") {

          // Whitelist of the only possible actions
          switch (action) {
            /**
             * @url /configurations/search/:field/:direction/:page
             */
            case "search":
              if (name) {
                // Only allow searching based on valid names
                if (["name", "hostname", "username", "port"].indexOf(name) >= 0) {
                  // Limit the directions to ascending and descending
                  var dir = arguments[2] || 'asc';
                  if (["asc", "desc"].indexOf(dir) < 0) {
                    // Sane default
                    dir = 'asc';
                  }
                  // Start page indexing at 0
                  var page = arguments[3] || 1;
                  if (page < 1) {
                    page = 1;
                  }
                  if (_self.checkCSRF()) {
                    return JSON.stringify({
                      "configurations": [
                        cf.fetch(
                          name,
                          dir,
                          page
                        );
                      ]
                    });
                  }
                  return JSON.stringify({"message": "CSRF Violation"});
                } else {
                  // Invalid field name.
                }
              }
              break;
            /**
             * @url /configurations/get/:id
             */
            case "get":
              if (name) {
                if (_self.checkCSRF()) {
                  return JSON.stringify({
                    "configurations": [
                      cf.get(name)
                    ]
                  });
                }
                return JSON.stringify({"message": "CSRF Violation"});
              }
              break;

            /**
             * @url /configurations/modify/:id
             */
            case "modify":
              if (name) {
                if (typeof(_self.request.POST.config !== "undefined")) {
                  if (_self.checkCSRF()) {
                    if (
                         typeof(_self.request.POST.config.hostname) === "undefined"
                      || typeof(_self.request.POST.config.port) === "undefined"
                      || typeof(_self.request.POST.config.username) === "undefined"
                    ) {
                      return JSON.stringify({
                        "error": "Incomplete object received. Please try again."
                      });
                    }
                    cf.modify(name, _self.request.POST.config);
                    return JSON.stringify({
                      "modified": name,
                      "configuration": _self.request.POST.config
                    });
                  }
                  return JSON.stringify({"message": "CSRF Violation"});
                }
              }
              break;

            /**
             * @url /configurations/delete/:id
             */
            case "delete":
              if (name) {
                if (_self.checkCSRF()) {
                  cf.delete(name);
                  return JSON.stringify({
                    "deleted": name
                  });
                }
                return JSON.stringify({"message": "CSRF Violation"});
              }
              break;

            /**
             * @url /configurations/create
             */
            case "create":
              if (typeof(_self.request.POST.config !== "undefined")) {
                if (typeof(_self.request.POST.name !== "undefined")) {
                  if (_self.checkCSRF()) {
                    var id = cf.getIndexByName(_self.request.POST.config.name);
                    if (id === null) {
                      if (
                           typeof(_self.request.POST.config.hostname) === "undefined"
                        || typeof(_self.request.POST.config.port) === "undefined"
                        || typeof(_self.request.POST.config.username) === "undefined"
                      ) {
                        return JSON.stringify({
                          "error": "Incomplete object received. Please try again."
                        });
                      }
                      var name = cf.create(_self.request.POST.config);
                      return JSON.stringify({
                        "modified": name,
                        "configuration": _self.request.POST.config
                      });
                    } else {
                      return JSON.stringify({
                        "error": "There is already a configuration with this name",
                        "name": name
                      });
                    }
                  }
                  return JSON.stringify({"message": "CSRF Violation"});
                }
              }
              break;
          }

          // If we don't return data above, just return a generic error message
          return JSON.stringify({"message": "An unknown error has occurred"});
        }
      }
      return _self.handlers.default();
    },

    /**
     * Default hander -- also the index page
     */
    "default": function() {
      var user = require("../lib/users.js");
      if (typeof(_self.request.session_data) !== "undefined") {
        if (typeof(_self.request.session_data.userid) !== "undefined") {
          var username = user.getById(_self.request.session_data.userid);
          return JSON.stringify({
            "message": "Welcome, " + username.name + "!"
          });
        }
      }
      _self.request.send_headers["Content-Type"] = "application/json";

      // _self.request.send_headers["Content-Type"] = "text/html;charset=UTF-8";
      return JSON.stringify({
        "message": "Please authenticate",
        "form": {
          "action": "/login",
          "fields": [
            {
              "name": "username",
              "type": "text"
            },
            {
              "name": "password",
              "type": "password"
            }
          ]
        }
      });
      //+ "\n<hr /><form action='/login' method='post'><input type='text' name='username' /><input type='password' name='password' /><button type='submit'>Log In</button></form>";
    }
  };

  this.api = [
    {
      "pattern": /^\/login/,
      "call": this.handlers.login
    },
    {
      "pattern": /^\/logout/,
      "call": this.handlers.logout
    },
    {
      "pattern": /^\/configurations\/(get|search|modify|delete|create)(?:\/([a-z0-9]+))?/,
      "call": this.handlers.handleConfig
    }
  ];

  this.route = function(request, response) {
    // Basic RESTful router
    var found = null;

    // Handle HTTP cookies
    var cdata = {};
    if ("cookie" in request.headers) {
      cdata = cookies.get(request.headers.cookie);
    }

    request.session_data = {};
    // Sessions
    if (cdata['session']) {
      var sdata = session.start(cdata['session']);
      request.session_id = sdata.session_id;
      request.session_data = sdata.data || {};
      request.cookie_data = cdata;
    } else {
      var sdata = session.start();
      cdata['session'] = sdata.session_id;
      request.session_id = sdata.session_id;
      request.session_data = {};
      request.cookie_data = cdata;
    }

    if (!cdata['csrf_token']) {
      request.cookie_data["csrf_token"] = secure.base64_encode(
        require('crypto').randomBytes(33)
      );
    }

    request.send_headers = {};
    _self.request = request;

    // RESTful router
    for (var i in this.api) {
      var url = request.url;
      if (typeof(this.api[i].pattern) !== 'object') {
        continue;
      }
      found = request.url.match(this.api[i].pattern);
      if (found) {
        var params = [];
        for (var j = 1; j < found.length; j++) {
          params.push(found[j]);
        }
        switch (params.length) {
          case 4:
            var body = this.api[i].call(params[0], params[1], params[2], params[3]);
            break;
          case 3:
            var body = this.api[i].call(params[0], params[1], params[2]);
            break;
          case 2:
            var body = this.api[i].call(params[0], params[1]);
            break;
          case 1:
            var body = this.api[i].call(params[0]);
            break;
          case 0:
            var body = this.api[i].call();
            break;
        }
        break;
      }
    }
    // Default handler:
    if (!found) {
      var body = this.handlers.default();
    }
    // This is where we set the cookie on the client's computer
    response.setHeader('Set-Cookie', cookies.collapse(_self.request.cookie_data));
    for (id in _self.request.send_headers) {
      response.setHeader(id, _self.request.send_headers[id]);
    }
    response.write(body);
    response.end();

    console.log([
      _self.request.session_id,
      _self.request.session_data
    ]);
    // Save session data
    session.write(_self.request.session_id, _self.request.session_data);
  };

  module.exports = this;
})();
