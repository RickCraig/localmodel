/*!
 * LocalModel
 * Developer: Rick Craig
 * https://github.com/RickCraig/localmodel
 */

'use strict';

/**
 * Generates a random UUID
 * @private
 * @returns {String} random id
 */
var generateUUID = function(){
  var d = Date.now();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c==='x' ? r : (r&0x3|0x8)).toString(16);
    });
  return uuid;
};

/**
 * Builds the key for the data
 * @private
 * @param {String} name - of the model
 * @param {String} id - of the entry
 * @returns {String} the merged key name
 */
var getKey = function(name, id) {
  return name + '::' + id;
};

/**
 * Adds the index for the new entry
 * @private
 * @param {String} name - the name of the model
 * @param {String} newIndex - the key for the new entry
 */
var addIndex = function(name, newIndex) {
  var indexName = name + '-index';
  var indexString = localStorage.getItem(indexName);
  var indices = indexString ? JSON.parse(indexString) : [];
  indices.push(newIndex);
  localStorage.setItem(indexName, JSON.stringify(indices));
};

/**
 * Returns the indices for a model
 * @private
 * @param {String} name - the model name
 * @returns {Array} the indices
 */
var getIndices = function(name) {
  var indices = localStorage.getItem(name + '-index');
  return JSON.parse(indices);
};

/**
 * Get a specific index from the indices
 * @private
 * @param {Array} indices
 * @param {String} term
 * @returns {String} matching index
 */
var getIndex = function(indices, term) {
  var regex = new RegExp('::' + term, 'g');
  for (var i = 0; i < indices.length; i++) {
    var index = indices[i];
    if (regex.test(index)) {
      return index;
    }
  }
  return;
};

/**
 * Checks if an object is empty
 * @private
 * @param {Object} obj
 * @returns {Boolean} true if empty
 */
var isEmpty = function(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
};

/**
 * Checks an array of booleans for a false
 * @private
 * @param {Array} arr - an array of booleans
 * @returns {Boolean} true if contains a false
 */
var containsFalse = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (!arr[i]) {
      return true;
    }
  }
  return false;
};

/**
 * Takes in a data string and returns
 * true if query matches
 * @private
 * @param {String} data - the string to match
 * @param {Mixed} query
 * @returns {Boolean} true if the data matches the query
 */
var matchQuery = function(data, query) {
  // Query using regular expression
  if (query instanceof RegExp) {
    return query.test(data);
  }

  // Query using string
  if (typeof query === 'string') {
    return data === query;
  }

  if (typeof query === 'object') {
    // Do the business in here for $gte, $gt, $lte, $lt
    // Remember to tag this 0.0.2

    if (typeof data === 'number') {
      var matches = [];
      if (query.$gte) {
        matches.push(query.$gte <= data);
      }

      if (query.$gt) {
        matches.push(query.$gt < data);
      }

      if (query.$lte) {
        matches.push(query.$lte >= data);
      }

      if (query.$lt) {
        matches.push(query.$lt > data);
      }

      return !containsFalse(matches);
    }

  }

  return false;
};

/**
 * Local Document constructor
 * @public
 * @param {Object} data - the entry raw data
 */
var LocalDocument = function(data, schema) {
  this.schema = schema;

  // Try to force the schema type
  for (var key in data) {
    var type = schema.schema[key]
    var property = data[key];

    if (type === LocalSchema.SchemaTypes.Date) {
      property = new Date(property);
    }

    this[key] = property;
  }
};

/**
 * Used to save the document when updated
 * @public
 */
LocalDocument.prototype.save = function() {
  // Build the object to save
  var toBeSaved = {};
  for (var key in this.schema.schema) {
    toBeSaved[key] = this[key];
  }

  var itemKey = getKey(this.schema.name, this._id);
  localStorage.setItem(itemKey, JSON.stringify(toBeSaved));
};

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
    newEntry[key] = data[key];
  }

  // Save to localstorage
  // At some point if there is an index, it can be added the the key for speed
  var index = getKey(this.name, newEntry._id);
  localStorage.setItem(index, JSON.stringify(newEntry));
  addIndex(this.name, index);

  // Clear indices
  this.indices = null;

  return newEntry;
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
      if (!queryItem) { continue; }
      if (parsed[key]) {
        matches.push(matchQuery(parsed[key], queryItem));
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

/**
 * LocalModel constructor
 * @public
 * @param {Object} options
 */

var LocalModel = function(options) {
  this.options = options || {};
  this.models = {};
};

/**
 * Adds a model schema to the list of models
 * @public
 * @param {String} name - the name of the model
 * @param {Object} schema - the schema for the model
 * @returns {Object} the schema;
 */
LocalModel.prototype.addModel = function(name, schema) {
  var model = new LocalSchema(name, schema);
  this.models[name] = model;
  return model;
};

/**
 * Returns the schema for the model by name
 * @public
 * @param {String} name - the name of the model
 * @returns {Object} the model schema
 */
LocalModel.prototype.model = function(name) {
  if (!this.models[name]) {
    console.error('The model with name "' + name + '" does not exist.');
    return null;
  }
  return this.models[name];
};
