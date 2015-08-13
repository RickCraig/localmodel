'use strict';

/**
 * Aggregate constructor
 * @private
 */
var LocalAggregate = function() {};

/**
 * Returns matched data from an array
 * @private
 * @param {Array} data
 * @param {Object} query
 * @param {Object} schema - the schema
 * @returns {Array} and array of matched data
 */
LocalAggregate.prototype.match = function(data, query, schema) {
  return data.filter(function(entry) {
    var matches = schema.checkEntry(entry, query.$match);
    if (matches.length > 0 && !containsFalse(matches)) {
      return true;
    } else {
      return false;
    }
  });
};

/**
 * Groups the data
 * @private
 * @param {Array} data - all the data
 * @param {Object} group - the group query
 * @returns {Array} of grouped entries
 */
LocalAggregate.prototype.group = function(data, group) {
  var groupBy = group._id;
  var grouped = [];
  var totalEntries = data.length;
  for (var g = 0; g < totalEntries; g++) {
    var entryResult = data[g][groupBy];
    var dataLocation = findInArray(grouped, '_id', entryResult);
    if (dataLocation === -1) {
      grouped.push({
        _id: entryResult,
        _group: [data[g]]
      });
      continue;
    }
    grouped[dataLocation]._group.push(data[g]);
  }
  return grouped;
};

/**
 * Get the First or Last of the group
 * @private
 * @param {Object} entry
 * @param {String} field
 * @param {String} key
 * @param {Boolean} first - true is first
 */
LocalAggregate.prototype.get = function(entry, field, key, first) {
  if (field && entry._group.length > 0) {
    var index = first ? 0 : entry._group.length-1;
    entry[key] = entry._group[index][field];
  }
};

/**
 * Does the sum of all in the group
 * @private
 * @param {Object} entry
 * @param {String} field
 * @param {String} key
 */
LocalAggregate.prototype.sum = function(entry, field, key) {
  if (field && entry._group.length > 0) {
    // Check if it's a number
    if (typeof field === 'number') {
      // Increment and times by number
      entry[key] = entry._group.length * field;
    } else {
      // Not a number use reduce
      entry[key] = entry._group.reduce(function(prev, curr) {
        return prev + curr[field];
      }, 0);
    }
  }
};

/**
 * Gets the average of all in the group
 * @private
 * @param {Object} entry
 * @param {String} field
 * @param {String} key
 */
LocalAggregate.prototype.avg = function(entry, field, key) {
  if ( field && entry._group.length > 0 &&
    typeof entry._group[0][field] === 'number') {
    var totalInGroup = entry._group.length;
    var totalToAverage = 0;
    for (var i = 0; i < totalInGroup; i++) {
      totalToAverage += entry._group[i][field];
    }
    entry[key] = totalToAverage / totalInGroup;
  }
};

/**
 * Get the maximum or minimum number
* @private
 * @param {Object} entry
 * @param {String} field
 * @param {String} key
 * @param {Boolean} max - true if looking for max
 */
LocalAggregate.prototype.minMax = function(entry, field, key, max) {
  if (field && entry._group.length > 0 &&
    typeof entry._group[0][field] === 'number') {
    var totalInGroup = entry._group.length;
    var result = 0;
    for (var i = 0; i < totalInGroup; i++) {
      var num = entry._group[i][field];
      result = max ? Math.max(result, num) : Math.min(result, num);
    }
    entry[key] = result;
  }
};

