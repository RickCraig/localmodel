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
};
