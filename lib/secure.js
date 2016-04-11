(function() {
  /**
   * Constant-time buffer comparison function
   *
   * @param Buffer a
   * @param Buffer b
   * @return boolean
   */
  this.hash_equals = function(a, b) {
    if (a.length != b.length) {
      return false;
    }
    var diff = 0;
    for (var i = 0; i < a.length; i++) {
      diff |= a[i] ^ b[i];
    }
    return diff === 0;
  };

  /**
   * Base-64 encoding according to the alphabet used by crypt(3)
   *
   * @param Buffer buf
   * @return string
   */
  this.base64_encode = function(buf) {
    return buf.toString('base64').replace('+', '.');
  };

  /**
   * Base-64 decoding according to the alphabet used by crypt(3)
   *
   * @param string
   * @return Buffer buf
   */
  this.base64_decode = function(str) {
    return new Buffer(str.replace('.', '+'), 'base64');
  };

  module.exports = this;
})();
