/**
 * Storage service, using LocalStorage and SessionStorage
 */

/**
 * Storage object
 * @constructor
 */
var Storage = function(_opts) {
  var opts = _opts || {};
  this.adapter = opts.adapter || "localStorage";
  this.name = opts.name;

  if(!this.name) {
    throw new Error("Storage must have a name");
  }

  this.parent = _opts.parent || null;
  this.children = {};
};


/**
 * Storage adapters
 * @static
 */
Storage.adapters = {
  localStorage: {
    get: function(key) {
      return JSON.decode(window.localStorage[key]);
    },
    set: function(key, val) {
      window.localStorage[key] = JSON.stringify(val);
    }
  },

  sessionStorage: {
    get: function(key) {
      return JSON.decode(window.sessionStorage[key]);
    },
    set: function(key, val) {
      window.sessionStorage[key] = JSON.stringify(val);
    }
  },

  memory: {
    data: {},
    get: function(key) {
      return Storage.adapters.memory.data[key];
    },
    set: function(key, value) {
      Storage.adapters.memory.data[key] = value;
    }
  }
};

/**
 * Get the value at the given key
 * @param {string} key
 * @returns The value
 */
Storage.prototype.get = function(key) {
  var path = this.getPath() + ":" + key;
  return this._getAdapter().get(path);
};

/**
 * Set a value at the given key
 * @param {string} key
 * @param value Value to set. If undefined, deletes the key
 */
Storage.prototype.set = function(key, value) {
  var path = this.getPath() + ":" + key;
  this._getAdapter().set(path, value);
};

/**
 * Returns Storage for namespace. Creates one if none exists, using specified adapter
 * @param {string} name - Name of the namespace
 * @param {(string|object)} [adapter=localStorage] - Adapter to use
 * @return {Storage}
 */
Storage.prototype.namespace = function(name, adapter) {
  if(!(name in this.children)) {
    this.children[name] = new Storage({
      adapter: adapter,
      name: name,
      parent: this
    });
  }

  return this.children[name];
};

Storage.prototype.ns = Storage.prototype.namespace;

/**
 * Get Storage path
 * @return Storage path
 */
Storage.prototype.getPath = function() {
  var prefix = (this.parent ? (this.parent.getPath() + ":") : "");
  return prefix + this.name;
};

/**
 * Get Storage adapter
 * @return Storage adapter
 * @private
 */
Storage.prototype._getAdapter = function() {
  if(typeof this.adapter === "object") {
    return this.adapter;
  }
  else if(this.adapter in Storage.adapters) {
    return Storage.adapters[this.adapter];
  }
  else {
    throw new Error("Unknown adapter " + this.adapter.toString());
  }
};

if(!Storage.rootInstance) {
  Storage.rootInstance = new Storage({
    adapter: "localStorage",
    name: "zestedesavoir"
  });
};

module.exports = Storage.rootInstance;
