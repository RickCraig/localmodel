/**
 * LocalModel constructor
 * @public
 * @param {Object} options
 */
var LocalModel = function(options) {
  if (typeof Storage === 'undefined') {
    console.error(new Error('Storage is not supported in this browser'));
  }

  this.options = options || {};
  this.models = {};

  if (!options.storage) {
    this.options.storage = localStorage;
  }
};

/**
 * Adds a model schema to the list of models
 * @public
 * @param {String} name - the name of the model
 * @param {Object} schema - the schema for the model
 * @returns {Object} the schema;
 */
LocalModel.prototype.addModel = function(name, schema) {
  var model = new LocalSchema(name, schema, this.options);
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
