var fs = require('fs');
var crypto = require('crypto');

/**
 * Written by Scott Arciszewski for the sake of this challenge.
 */
(function() {
  this.read = function(session_id) {
    var session_id = session_id.replace(/[^0-9A-Za-z]+/, '');

    try {
      var stat = fs.statSync("tmp/session/" + session_id + ".json");
    } catch (e) {
      var stat = false;
    }

    if (stat) {
      var session_data = fs.readFileSync("tmp/session/" + session_id + ".json").toString();
      if (typeof(session_data) === "string") {
        return JSON.parse(session_data);
      }
    }
    return null;
  };

  this.write = function(session_id, data) {
    if (typeof(data) === "undefined") {
      data = {};
    }
    return fs.writeFileSync(
      "tmp/session/" + session_id.replace(/[^0-9A-Za-z]+/, '') + ".json",
      JSON.stringify(data)
    );
  };

  this.start = function(session_id) {
    session_id = session_id || this.generate_id();
    var data = this.read(session_id);
    if (data === null) {
      console.log(session_id);
      this.write(session_id, {});
    }
    return {
      "session_id": session_id,
      "data": data
    };
  };

  this.destroy = function(session_id) {
    fs.unlinkSync("tmp/session/" + session_id.replace(/[^0-9A-Za-z]+/, '') + ".json");
  };

  this.generate_id = function() {
    var buf = '';
    while (buf.length < 32) {
      buf += crypto.randomBytes(32)
        .toString('base64')
        .replace(/[^0-9A-Za-z]+/, '');
    }
    return buf.substr(0, 32);
  };

  module.exports = this;
})();
