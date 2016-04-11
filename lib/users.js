var crypto = require("crypto");
var secure = require("../lib/secure.js");

(function () {
  this.users = [
    {
      "id": 1,
      "username": "admin",
      "password": "pbkdf2$sha512$48$86000$TwzP42Tf6sAr0cGzgoYFEhXQ$mx8eo0RpVmtpQd1Qkf832z2zXeuP9i8GoT0cRiV2KzIT3Mr1kNAGOHlYnII/sEkk",
      "name": "Administrator",
      "location": "Planet Earth"
    },
    {
      "id": 2,
      "username": "guest",
      "password": "pbkdf2$sha512$48$86000$o8tJ6R4MR5ptVOl39wE7OiNv$Kos7kmaHgWMxoujWP9Ow3mUufBsyBxZNbZXSUjTF8LRIdfwEtIK0uK3C4JwjnyDX",
      "name": "Greg Uest",
      "location": "Planet Earth"
    }
  ];

  this.authenticate = function(username, password) {
    var user = this.getUser(username);
    if (user === null) {
      return false;
    }
    if (this.password_verify(password, user.password)) {
      return user;
    }
    return false;
  };

  this.getById = function(id) {
    for (i in this.users) {
      if (this.users[i].id == id) {
        return this.users[i];
      }
    }
    return null;
  };

  this.getUser = function(username) {
    for (i in this.users) {
      if (this.users[i].username == username) {
        return this.users[i];
      }
    }
    return null;
  };

  this.password_hash = function(password) {
    var salt = crypto.randomBytes(18);
    var hash = crypto.pbkdf2Sync(password, salt, 86000, 48, 'sha512');
    return [
      'pbkdf2',
      'sha512',
      48,
      86000,
      secure.base64_encode(salt),
      secure.base64_encode(hash)
    ].join('$');
  };

  this.password_verify = function(password, hash) {
    var parts = hash.split('$');
    if (parts.length != 6) {
      return false;
    }
    var calc = crypto.pbkdf2Sync(
      password,
      secure.base64_decode(parts[4]),
      parseInt(parts[3], 10),
      parseInt(parts[2], 10),
      secure.base64_decode(parts[1])
    );
    return secure.hash_equals(calc, secure.base64_decode(parts[5]));
  };

  module.exports = this;
})();
