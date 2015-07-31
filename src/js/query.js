'use strict';

/**
 * Handle date
 * @private
 * @param {Object} data
 * @param {Object} query
 * @param {Boolean} isDate
 * @returns {Boolean} true if matched
 */
var handleSums = function(data, query, isDate) {
  var dateMatches = [];

  if (query.$gte) {
    var gte = isDate ? new Date(query.$gte) : query.$gte;
    dateMatches.push(gte <= data);
  }

  if (query.$gt) {
    var gt = isDate ? new Date(query.$gt) : query.$gt;
    dateMatches.push(gt < data);
  }

  if (query.$lte) {
    var lte = isDate ? new Date(query.$lte) : query.$lte;
    dateMatches.push(lte >= data);
  }

  if (query.$lt) {
    var lt = isDate ? new Date(query.$lt) : query.$lt;
    dateMatches.push(lt > data);
  }

  return !containsFalse(dateMatches);
};

/**
 * Handles the object
 * @private
 * @param {Object} data
 * @param {Object} query
 * @returns {Boolean} true if there is a match
 */
var handleQueryObject = function(data, query) {
  // Do the business in here for $gte, $gt, $lte, $lt

  if (typeof data === 'number') {
    return handleSums(data, query);
  }

  if (data instanceof Date) {
    return handleSums(data, query, true);
  }

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

  // Query using string or number
  if (typeof query === 'string' ||
    typeof query === 'number') {
      return data === query;
    }

  if (typeof query === 'object') {
    return handleQueryObject(data, query);
  }
};
