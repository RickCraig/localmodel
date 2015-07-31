'use strict';

/**
 * Local Document constructor
 * @public
 * @param {Object} data - the entry raw data
 */
var LocalDocument = function(data, schema) {
  this.schema = schema;
  this.schema.options.debug.start('Instantiating entry');
  this.data = {};
  this.indexKey = getKey(schema.name, data._id);

  // Add ID
  if (data._id) {
    this.data._id = data._id;
  }

  // Try to force the schema type
  var total = schema.keys.length;
  for (var i = 0; i < total; i++) {
    var key = schema.keys[i];
    var property = data[key];

    property = LocalDocument.convert(key, property, schema.schema);

    if (property) {
      this.data[key] = property;
    }
  }
  this.schema.options.debug.end('Instantiating entry');
};

/**
 * Forces the types
 * @public
 * @param {String} key
 * @param {String/Number} property - the data needing converted
 * @param {Object} schema - the model schema
 * @returns {Object/String/Number} the converted property
 */
LocalDocument.convert = function(key, property, schema) {
  var type;
  if (typeof schema[key] === 'object') {

    // Get the type
    if (!schema[key].type) {
      type = LocalSchema.SchemaTypes.String;
    } else {
      type = schema[key].type;
    }

    // Set the default if it exists
    if (schema[key].default && !property) {
      property = schema[key].default;
    }
  } else {
    type = schema[key];
  }

  if (property && type === LocalSchema.SchemaTypes.Date) {
    property = new Date(property);
  }

  return property;
};

/**
 * Used to save the document when updated
 * @public
 */
LocalDocument.prototype.save = function() {
  this.schema.options.debug.start('Saving entry');
  // Build the object to save
  var toBeSaved = {};
  var total = this.schema.keys.length;
  for (var i = 0; i < total; i++) {
    var key = this.schema.keys[i];
    toBeSaved[key] = this.data[key];
  }
  toBeSaved._id = this.data._id;

  var itemKey = getKey(this.schema.name, this.data._id);
  this.schema
    .options
    .storage
    .setItem(itemKey, JSON.stringify(toBeSaved));
  this.schema.options.debug.end('Saving entry');
};

/**
 * Used to wipe this document from memory
 * @public
 */
LocalDocument.prototype.remove = function() {
  this.schema.options.debug.start('Removing entry');
  // Remove the key from indices
  removeIndex(
    this.schema.name,
    this.indexKey,
    this.schema.options
  );

  // Remove the data from storage
  localStorage.removeItem(this.indexKey);

  // Allow the schema to update
  this.schema.indices = null;
  this.schema.options.debug.end('Removing entry');
};
