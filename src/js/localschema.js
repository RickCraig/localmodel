/**
 * Local Schema constructor
 * @public
 * @param {Object} schema
 */
var LocalSchema = function(name, schema) {
  this.schema = schema;
  this.name = name;
};

/**
 * Create a new data object for this schema
 * @public
 * @param {Object} data
 * @returns {}
 */
LocalSchema.prototype.create = function(data) {
  var newEntry = {};
  newEntry._id = generateUUID();
  for (var key in this.schema) {
    var value = data[key];
    if (!value && this.schema[key].default) {
      value = this.schema[key].default;
    }
    newEntry[key] = value;
  }

  // Save to localstorage
  // At some point if there is an index, it can be added the the key for speed
  var index = getKey(this.name, newEntry._id);
  localStorage.setItem(index, JSON.stringify(newEntry));
  addIndex(this.name, index);

  // Clear indices
  this.indices = null;

  return new LocalDocument(newEntry, this);
};

/**
 * Returns all entries in storage
 * @public
 * @returns {Array} all entries
 */
LocalSchema.prototype.all = function() {
  this.indices = this.indices || getIndices(this.name);
  var results = [];

  // Check if the collection is empty
  if (!this.indices) {
    return results;
  }

  for (var i = 0; i < this.indices.length; i++) {
    var index = this.indices[i];
    var result = JSON.parse(localStorage.getItem(index));
    results.push(new LocalDocument(result, this));
  }

  return results;
};

/**
 * Find an entry by ID
 * @public
 * @param {String} id
 * @returns {Object} the object or null
 */
LocalSchema.prototype.findById = function(id) {
  this.indices = this.indices || getIndices(this.name);
  var match = getIndex(this.indices, id);
  if (!match) {
    return null;
  }
  return new LocalDocument(JSON.parse(localStorage.getItem(match)), this);
};

/**
 * Find entries matching a query
 * @public
 * @param {Object} query
 * @returns {Array} an array of matches
 */
LocalSchema.prototype.find = function(query) {
  if (!query || isEmpty(query)) {
    return this.all();
  }

  this.indices = this.indices || getIndices(this.name);
  var results = [];

  // Check if the collection is empty
  if (!this.indices) {
    return results;
  }

  for (var i = 0; i < this.indices.length; i++) {
    var entry = localStorage.getItem(this.indices[i]);
    var parsed = JSON.parse(entry);
    var matches = [];

    for (var key in query) {
      var queryItem = query[key];
      var isRegex = queryItem instanceof RegExp;
      if (!isRegex &&
        (queryItem === '' || isEmpty(queryItem))) {
        continue;
      }

      if (parsed[key]) {
        matches.push(matchQuery(
          LocalDocument.convert(key, parsed[key], this.schema),
          queryItem
        ));
      } else {
        matches.push(false);
      }
    }

    if (!containsFalse(matches)) {
      results.push(new LocalDocument(parsed, this));
    }
  }

  return results;
};

/**
 * LocalSchema Schema Types
 * For use in validation and return
 * @public
 */
LocalSchema.SchemaTypes = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Mixed: 'mixed',
  Date: 'date'
};
