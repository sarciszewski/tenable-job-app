(function() {

  this.get = function(reqc) {
    var cookies = {};
    if (reqc) {
      reqc.split(';').forEach(function(cookie) {
        var parts = cookie.split('=');
        cookies[parts.shift().trim()] = decodeURI(parts.join('='));
      });
    }
    return cookies;
  };

  this.collapse = function(cdata) {
    var cookie = [];
    Object.keys(cdata).forEach(function(i) {
      cookie.push(i + "=" + encodeURI(cdata[i]) + "; secure; httponly");
    });
    return cookie;
  };

  module.exports = this;
})();
