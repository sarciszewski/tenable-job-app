var fs = require("fs");

(function() {
  var _self = this;
  this.filename = "data/config.json";
  this.per_page = 5;

  try {
    var _data = fs.readFileSync(this.filename);
    this.data = JSON.parse(_data);
    delete _data;
  } catch (err) {
    this.data = {
      "configurations": []
    };
  }

  this.get = function(name) {
    var i = _self.getIndexByName(name);
    if (i !== null) {
      return _self.data[i];
    }
    return null;
  };

  this.fetch = function(sortby, direction, page) {
    var tmp = _self.data;
    var offset = (page - 1) * _self.per_page;
    tmp.sort(function(a, b) {
      if (a[sortby] > b[sortby]) {
        return 1;
      } else if (a[sortby] < b[sortby]) {
        return -1;
      }
      return 0;
    });
    if (direction == 'desc') {
      tmp.reverse();
    }
    return tmp.slice(offset, _self.per_page);
  };

  this.getIndexByName = function(name) {
    for (var i in _self.data) {
      if (_self.data[i].name === name) {
        return i;
      }
    }
    return null;
  };

  this.save = function() {
    fs.writeFileSync(
      _self.filename,
      JSON.stringify(_self.data)
    );
  };

  this.create = function(new_obj) {
    _self.data.push(new_obj);
    return new_obj.name;
  };

  this.modify = function(name, new_obj) {
    var i = _self.getIndexByName(name);
    var old = _self.data[i];
    if (typeof(new_obj.name) === "undefined") {
      new_obj.name = old.name;
    }
    if (typeof(new_obj.hostname) === "undefined") {
      new_obj.hostname = old.hostname;
    }
    if (typeof(new_obj.port) === "undefined") {
      new_obj.port = old.port;
    }
    if (typeof(new_obj.username) === "undefined") {
      new_obj.username = old.username;
    }
    _self.data[i] = new_obj;
    _self.save();
  };

  this.delete = function(name) {
    var i = _self.getIndexByName(name);
    _self.data.remove(i);
    _self.save();
  };

  module.exports = this;
})();
