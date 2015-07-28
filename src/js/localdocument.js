/**
 * Local Document constructor
 * @public
 * @param {Object} data - the entry raw data
 */
var LocalDocument = function(data, schema) {
  this.schema = schema;
  this.data = {};
  this.indexKey = getKey(schema.name, data._id);

  // Try to force the schema type
  for (var key in data) {
    var type = schema.schema[key];
    var property = data[key];

    if (type === LocalSchema.SchemaTypes.Date) {
      property = new Date(property);
    }

    this.data[key] = property;
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

  var itemKey = getKey(this.schema.name, this.data._id);
  localStorage.setItem(itemKey, JSON.stringify(toBeSaved));
};
