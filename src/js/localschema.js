'use strict';

/* jshint undef:true */

/**
 * Local Schema constructor
 * @public
 * @param {Object} schema
 */
var LocalSchema = function(name, schema, core, options) {
  this.schema = schema;
  this.name = name;
  this.options = options;
  this.core = core;
  this.keys = Object.keys(schema);
  this.keys.push('_id');
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
  this.keys.push('_id');
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
  var total = this.keys.length;
  for (var i = 0; i < total; i++) {
    var key = this.keys[i];
    if (key === '_id') {
      continue;
    }

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
  return new LocalDocument(newEntry, this);
};

/**
 * Returns all entries in storage
 * @public
 * @returns {Array} all entries
 */
LocalSchema.prototype.all = function() {
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
  var entries = this.find(query);
  var totalEntries = entries.length;
  if (totalEntries < 1) {
    return 0;
  }
  for (var i = 0; i < totalEntries; i++) {
    var entry = entries[i];
    var total = this.keys.length;
    for (var s = 0; s < total; s++) {
      var key = this.keys[s];
      if (typeof values[key] !== 'undefined') {
        entry[key] = values[key];
      }
    }
    entry.save();
  }
  return entries.length;
};

/**
 * Finds and the populates the results
 * @public
 * @param {Object} query
 * @param {String} names - space seperated
 * @param {Object} options
 * @returns {Array} of populated results
 */
LocalSchema.prototype.findAndPopulate = function(query, names, options) {
  var entries = this.find(query);
  var totalEntries = entries.length;
  if (totalEntries < 1) {
    return [];
  }
  var populated = [];
  for (var i = 0; i < totalEntries; i++) {
    populated.push(entries[i].populate(names, options));
  }
  return populated;
};

/**
 * contains the ability to match and group documents
 * @param {Array} pipeline - an array of queries
 * @returns {Array} data reduced by the pipeline
 */
LocalSchema.prototype.aggregate = function(pipeline) {
  var _this = this;
  var data = this.all();
  var totalEntries = data.length;
  var total = pipeline.length;
  for (var i = 0; i < total; i++) {
    var query = pipeline[i];
    if (query.$match) {
      // Do a filter on data
      data = data.filter(function(entry) {
        var matches = _this.checkEntry(entry, query.$match);
        if (matches.length > 0 && !containsFalse(matches)) {
          return true;
        } else {
          return false;
        }
      });
    } else if(query.$group) {
      // The _id tag is mandatory
      var group = query.$group;
      var groupData = [];
      if (typeof group._id === 'undefined') {
        console.error('the $group method must contain a _id tag');
        return;
      }

      var groupBy = group._id;
      for (var g = 0; g < totalEntries; g++) {
        var entryResult = data[g][groupBy];
        var dataLocation = findInArray(groupData, '_id', entryResult);
        if (dataLocation === -1) {
          groupData.push({
            _id: entryResult,
            _group: [data[g]]
          });
          continue;
        }
        groupData[dataLocation]._group.push(data[g]);
      }

      // Use group data below to add properties and counts
      var keys = Object.keys(query.$group);
      var totalKeys = keys.length;

      for (var k = 0; k < totalKeys; k++) {
        var key = keys[k];

        if (key !== '_id') {

          // Loop through results
          var totalGrouped = groupData.length;
          for (var ag = 0; ag < totalGrouped; ag++) {
            var current = groupData[ag];
            var totalInGroup = current._group.length;

            // Get $first
            if (group[key].$first &&
              current._group.length > 0) {
              // Get the first from the results array
              current[key] = current._group[0][group[key].$first];
            }

            // Get $last
            if (group[key].$last &&
              current._group.length > 0) {
              // Get the first from the results array
              current[key] = current
                ._group[current._group.length-1][group[key].$last];
            }

            // Do $sum
            if (group[key].$sum &&
              current._group.length > 0) {

              // Check if it's a number
              if (typeof group[key].$sum === 'number') {
                // Increment and times by number
                current[key] = current._group.length * group[key].$sum;
              } else {
                // Not a number use reduce
                current[key] = current._group.reduce(function(prev, curr) {
                  return prev + curr[group[key].$sum];
                }, 0);
              }
            }

            // Get $avg
            if (group[key].$avg &&
              current._group.length > 0 &&
              typeof current._group[0][group[key].$avg] === 'number') {
              var totalToAverage = 0;
              for (var a = 0; a < totalInGroup; a++) {
                totalToAverage += current._group[a][group[key].$avg];
              }
              current[key] = totalToAverage / totalInGroup;
            }

            // Get $max
            if (group[key].$max &&
              current._group.length > 0 &&
              typeof current._group[0][group[key].$max] === 'number') {
              var max = 0;
              for (var ma = 0; ma < totalInGroup; ma++) {
                var maxNum = current._group[ma][group[key].$max];
                if (maxNum > max) {
                  max = maxNum;
                }
              }
              current[key] = max;
            }

            // Get $min
            if (group[key].$min &&
              current._group.length > 0 &&
              typeof current._group[0][group[key].$min] === 'number') {
              var min = Infinity;
              for (var mi = 0; mi < totalInGroup; mi++) {
                var minNum = current._group[mi][group[key].$min];
                if (minNum < min) {
                  min = minNum;
                }
              }
              current[key] = min;
            }

          } // End of grouped loop
        } // End of check for _id
      } // End of loop through $group

      data = groupData;
    } else if(query.$sort) {
      if (typeof query.$sort === 'function') {
        data.sort(query.$sort);
      } else {
        console.warn('LocalModel: $sort should be a compare function');
      }
    } else if(query.$limit) {
      if (typeof query.$limit === 'number') {
        data = data.slice(0, query.$limit);
      } else {
        console.warn('LocalModel: $limit should be a number');
      }
    } else {
      console.error('LocalModel: Aggregate currently only supports ' +
        '$match, $group, $sort & $limit query types. Query ' +
        'types can not be empty.');
      return;
    }
  }

  return data;
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
