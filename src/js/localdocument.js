/**
 * Local Document constructor
 * @public
 * @param {Object} data - the entry raw data
 */
var LocalDocument = function(data, schema) {
  this.schema = schema;
  this.data = {};
  this.indexKey = getKey(schema.name, data._id);

  // Add ID
  if (data._id) {
    this.data._id = data._id;
  }

  // Try to force the schema type
  for (var key in schema.schema) {
    var type;
    var property = data[key];

    if (typeof schema.schema[key] === 'object') {

      // Get the type
      if (!schema.schema[key].type) {
        type = LocalSchema.SchemaTypes.String;
      } else {
        type = schema.schema[key].type;
      }

      // Set the default if it exists
      if (schema.schema[key].default && !property) {
        property = schema.schema[key].default;
      }
    } else {
      type = schema.schema[key];
    }

    if (property && type === LocalSchema.SchemaTypes.Date) {
      property = new Date(property);
    }

    if (property) {
      this.data[key] = property;
    }
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
    toBeSaved[key] = this.data[key];
  }

  console.log(toBeSaved);
  var itemKey = getKey(this.schema.name, this.data._id);
  localStorage.setItem(itemKey, JSON.stringify(toBeSaved));
};
