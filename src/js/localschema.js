'use strict';

/* jshint undef:true */

/**
 * Local Schema constructor
 * @public
 * @param {Object} schema
 */
var LocalSchema = function(name, schema, options) {
  this.schema = schema;
  this.name = name;
  this.options = options;
  this.keys = Object.keys(schema);
};

/**
 * Adds a property to the schema
 * @public
 * @param {Object} property
 */
LocalSchema.prototype.addToSchema = function(property) {
  var newKeys = Object.keys(property);
  var total = newKeys.length;
  for (var i = 0; i < total; i++) {
    this.schema[newKeys[i]] = property[newKeys[i]];
  }
  this.keys = Object.keys(this.schema);
};

/**
 * Create a new data object for this schema
 * @public
 * @param {Object} data
 * @returns {}
 */
LocalSchema.prototype.create = function(data) {
  this.options.debug.start('Creating ' + this.name);
  var newEntry = {};
  newEntry._id = generateUUID();
  var total = this.keys.length;
  for (var i = 0; i < total; i++) {
    var key = this.keys[i];
    var value = data[key];
    if (!value && this.schema[key].default) {
      value = this.schema[key].default;
    }
    newEntry[key] = value;
  }

  // Save to localstorage
  // At some point if there is an index, it can be added the the key for speed
  var index = getKey(this.name, newEntry._id);
  this.options.storage.setItem(index, JSON.stringify(newEntry));
  addIndex(this.name, index, this.options);

  // Clear indices
  this.indices = null;
  this.options.debug.end('Creating ' + this.name);
  return new LocalDocument(newEntry, this);
};

/**
 * Returns all entries in storage
 * @public
 * @returns {Array} all entries
 */
LocalSchema.prototype.all = function() {
  this.options.debug.start('Getting all ' + this.name + 's');
  var _this = this;
  this.indices = this.indices || getIndices(this.name, this.options);
  var results = [];

  // Check if the collection is empty
  if (!this.indices) {
    return results;
  }

  var total = this.indices.length;
  for (var i = 0; i < total; i++) {
    var index = this.indices[i];
    results.push(this.options.storage.getItem(index));
  }
  results = JSON.parse('[' + results.join(',') + ']');
  results = results.map(function(result) {
    return new LocalDocument(result, _this);
  });

  this.options.debug.end('Getting all ' + this.name + 's');

  return results;
};

/**
 * Find an entry by ID
 * @public
 * @param {String} id
 * @returns {Object} the object or null
 */
LocalSchema.prototype.findById = function(id) {
  this.indices = this.indices || getIndices(this.name, this.options);
  var match = getIndex(this.indices, id);
  if (!match) {
    return null;
  }
  return new LocalDocument(
    JSON.parse(
      this.options.storage.getItem(match)
    ), this);
};


/**
 * Looks through the schema for an entry
 * @private
 * @param {Object} entry - the parsed entry
 * @param {Object} query
 * @returns {Array} an array of matches
 */
LocalSchema.prototype.checkEntry = function(entry, query) {
  var total = this.keys.length;
  var matches = [];
  for (var q = 0; q < total; q++) {
    var key = this.keys[q];
    var queryItem = query[key];
    if (typeof queryItem === 'undefined') {
      continue;
    }

    var isRegex = queryItem instanceof RegExp;
    var checkEmpty = typeof queryItem === 'object' && isEmpty(queryItem);
    if (!isRegex && (queryItem === '' || checkEmpty)) {
      continue;
    }

    if (entry[key]) {
      matches.push(matchQuery(
        LocalDocument.convert(key, entry[key], this.schema),
        queryItem
      ));
    }
  }
  return matches;
};

/**
 * Find entries matching a query
 * @public
 * @param {Object} query
 * @param {Boolean} isCount - return a count when true
 * @returns {Array/Number} an array of matches or
 * a number if isCount = true
 */
LocalSchema.prototype.find = function(query, isCount) {
  this.options.debug.start('Finding ' + this.name + 's');
  this.indices = this.indices || getIndices(this.name, this.options);
  if (!query || isEmpty(query)) {
    return isCount ? this.indices.length : this.all();
  }

  var results = isCount ? 0 : [];

  // Check if the collection is empty
  if (!this.indices) {
    return results;
  }

  for (var i = 0; i < this.indices.length; i++) {
    var entry = this.options.storage.getItem(this.indices[i]);
    var parsed = JSON.parse(entry);
    var matches = this.checkEntry(parsed, query);

    if (matches.length > 0 && !containsFalse(matches)) {
      if (!isCount) {
        results.push(new LocalDocument(parsed, this));
      } else {
        results++;
      }
    }
  }

  this.options.debug.end('Finding ' + this.name + 's');
  this.options.debug.log(results.length + ' results found');

  return results;
};

/**
 * Remove entries utilising the find query
 * @public
 * @param {Object} query
 * @returns {Number} the number of items removed
 */
LocalSchema.prototype.remove = function(query) {
  var entries = this.find(query);

  // Remove each entry individually
  for (var i = 0; i < entries.length; i++ ) {
    entries[i].remove();
  }

  return entries.length;
};

/**
 * Helper to return a count of results
 * @public
 * @param {Object} query
 * @returns {Number} the count of results
 */
LocalSchema.prototype.count = function(query) {
  return this.find(query, true);
};

/**
 * A batch updater
 * @public
 * @param {Object} query - to find entries to update
 * @param {Object} values - the values to update
 * @returns {Number} the number of entries changed
 */
LocalSchema.prototype.update = function(query, values) {
  this.options.debug.start('Updating ' + this.name + 's');
  var entries = this.find(query);
  var totalEntries = entries.length;
  for (var i = 0; i < totalEntries; i++) {
    var entry = entries[i];
    var total = this.keys.length;
    for (var s = 0; s < total; s++) {
      var key = this.keys[s];
      if (typeof values[key] !== 'undefined') {
        entry.data[key] = values[key];
      }
    }
    entry.save();
  }
  this.options.debug.end('Updating ' + this.name + 's');
  return entries.length;
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
