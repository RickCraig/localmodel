'use strict';

/* jshint undef:true */

/**
 * Local Document constructor
 * @public
 * @param {Object} data - the entry raw data
 */
var LocalDocument = function(data, schema) {
  this._schema = schema;
  this._original = {};
  this._indexKey = getKey(schema.name, data._id);

  // Add ID
  if (data._id) {
    this._original._id = data._id;
    this._id = data._id;
  }

  // Try to force the schema type
  var total = schema.keys.length;
  for (var i = 0; i < total; i++) {
    var key = schema.keys[i];
    var property = data[key];

    property = LocalDocument.convert(key, property, schema.schema);

    if (property) {
      this._original[key] = property;
      this[key] = property;
    }
  }
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
  // Build the object to save
  var toBeSaved = {};
  var total = this._schema.keys.length;
  for (var i = 0; i < total; i++) {
    var key = this._schema.keys[i];

    // Check this[key] doesn't contain a local document,
    // if it does, ignore it, because it's a populate!
    if (!containsLocalDocument(this[key])) {
      toBeSaved[key] = this[key];
    } else {
      toBeSaved[key] = this._original[key];
    }
  }
  toBeSaved._id = this._id;

  var itemKey = getKey(this._schema.name, this._id);
  this._schema
    .options
    .storage
    .setItem(itemKey, JSON.stringify(toBeSaved));
};

/**
 * Used to populate a property with the
 * relative entry/entries from another model
 * @public
 * @param {String} names - the referring property names
 * @param {Object} includes - the properties to include
 * from the other model
 * @param {Object} options
 */
LocalDocument.prototype.populate = function(names, options) {
  // http://mongoosejs.com/docs/populate.html
  var split = names.split(' ');

  for (var n = 0; n < split.length; n++) {
    var name = split[n];
    // Check the 'name' has a ref property in the schema
    var ref = this._schema.schema[name].ref;
    if (!ref) {
      console.error('The name ' + name + ' does not have a ref');
      return;
    }

    // Use the ref to get the other model localModel.model(ref)
    var model = this._schema.core.model(ref);

    // default uses the _id as the foreign key
    var query = { _id: this[name] };

    // allow the user to set a custom foreign key
    var foreignKey = this._schema.schema[name].foreignKey;
    if (foreignKey) {
      query = {};
      query[foreignKey] = this[name];
    }

    if (options && options.match) {
      // Merge the match object with the query object;
      query = merge(options.match, query);
    }

    // Do a find on the model from this name
    var related = model.find(query);

    if (related.length > 0) {

      if (options) {

        // Sorting: pass a sort function
        if (options.sort && typeof options.sort === 'function') {
          related.sort(options.sort);
        }

        // Set the limit if set
        if (
          options.limit &&
          typeof options.limit === 'number' &&
          related.length > options.limit
        ) {
          related = related.splice(0, options.limit);
        }

        if (options.select) {
          var select = options.select.split(' ');
          related = related.map(function(entry) {
            var mapped = {};
            // Show only the fields in select
            for (var i = 0; i < select.length; i++) {
              mapped[select[i]] = entry[select[i]];
            }
            return mapped;
          });
        }

      }

      this[name] = related.length === 1 ? related[0] : related;
    }
  }

  return this;

};

/**
 * Used to wipe this document from memory
 * @public
 */
LocalDocument.prototype.remove = function() {
  // Remove the key from indices
  removeIndex(
    this._schema.name,
    this._indexKey,
    this._schema.options
  );

  // Remove the data from storage
  localStorage.removeItem(this._indexKey);

  // Allow the schema to update
  this._schema.indices = null;
};
