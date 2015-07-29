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
      var numberMatches = [];
      if (query.$gte) {
        numberMatches.push(query.$gte <= data);
      }

      if (query.$gt) {
        numberMatches.push(query.$gt < data);
      }

      if (query.$lte) {
        numberMatches.push(query.$lte >= data);
      }

      if (query.$lt) {
        numberMatches.push(query.$lt > data);
      }

      return !containsFalse(numberMatches);
    }

    if (data instanceof Date) {
      var dateMatches = [];

      if (query.$gte) {
        dateMatches.push(new Date(query.$gte) <= data);
      }

      if (query.$gt) {
        dateMatches.push(new Date(query.$gt) < data);
      }

      if (query.$lte) {
        dateMatches.push(new Date(query.$lte) >= data);
      }

      if (query.$lt) {
        dateMatches.push(new Date(query.$lt) > data);
      }

      return !containsFalse(dateMatches);
    }

  }
};
