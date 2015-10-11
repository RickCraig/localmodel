'use strict';

/* jshint undef:false */

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
  if (isEmpty(query.$match)) {
    return data;
  }

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
 * Handles all of the group features
 * @private
 * @param {Array} data
 * @param {Object} query
 */
LocalAggregate.prototype.createGroup = function(data, query) {
  // The _id tag is mandatory
  var group = query.$group;
  var groupData = [];
  var _this = this;
  if (typeof group._id === 'undefined') {
    return console.error('the $group method must contain a _id tag');
  }

  groupData = _this.group(data, group);

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

        if (group[key].$first) {
          _this.get(current, group[key].$first, key, true);
        }

        if (group[key].$last) {
          _this.get(current, group[key].$last, key, false);
        }

        if (group[key].$sum) {
          _this.sum(current, group[key].$sum, key);
        }

        if (group[key].$avg) {
          _this.avg(current, group[key].$avg, key);
        }

        if (group[key].$max) {
          _this.minMax(current, group[key].$max, key, true);
        }

        if (group[key].$min) {
          _this.minMax(current, group[key].$min, key, false);
        }

      } // End of grouped loop
    } // End of check for _id
  } // End of loop through $group

  return groupData;
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
  if (typeof field !== 'string') {
    console.error('The first/last property must be a string');
    return;
  }

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
  if (typeof field !== 'string') {
    console.error('The $avg field must be a string');
    return;
  }

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
  if (typeof field !== 'string') {
    console.error('The $min & $max fields must be a string');
    return;
  }

  if (field && entry._group.length > 0 &&
    typeof entry._group[0][field] === 'number') {
    var totalInGroup = entry._group.length;
    var result = max ? 0 : Infinity;
    for (var i = 0; i < totalInGroup; i++) {
      var num = entry._group[i][field];
      result = max ? Math.max(result, num) : Math.min(result, num);
    }
    entry[key] = result;
  }
};

/**
 * Sorts the array
 * @private
 * @param {Array} data
 * @param {Function} field
 */
LocalAggregate.prototype.sort = function(data, field) {
  if (typeof field === 'function') {
    data.sort(field);
  } else {
    console.warn('LocalModel: $sort should be a compare function');
  }
};

/**
 * limits the array
 * @private
 * @param {Array} data
 * @param {Function} field
 */
LocalAggregate.prototype.limit = function(data, field) {
  if (typeof field === 'number') {
    return data.slice(0, field);
  } else {
    console.warn('LocalModel: $limit should be a number');
  }
};

