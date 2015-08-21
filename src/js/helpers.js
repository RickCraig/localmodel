'use strict';

/**
 * Checks if an object is empty
 * @private
 * @param {Object} obj
 * @returns {Boolean} true if empty
 */
var isEmpty = function(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
};

/**
 * Checks an array of booleans for a false
 * @private
 * @param {Array} arr - an array of booleans
 * @returns {Boolean} true if contains a false
 */
var containsFalse = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (!arr[i]) {
      return true;
    }
  }
  return false;
};

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @private
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {Object} obj1 and obj2 merged
 */
function merge(obj1, obj2) {
  var obj3 = {};
  var obj1Keys = Object.keys(obj1);
  var obj2Keys = Object.keys(obj2);
  for (var a = 0; a < obj1Keys.length; a++) {
    obj3[obj1Keys[a]] = obj1[obj1Keys[a]];
  }
  for (var b = 0; b < obj2Keys.length; b++) {
    obj3[obj2Keys[b]] = obj2[obj2Keys[b]];
  }
  return obj3;
}

/**
 * Checks an object or array for LocalDocuments
 * @private
 * @param {Object/Array} check
 * @returns {Boolean} true if it contains a LocalDocument
 */
var containsArray = function(check) {
  var isDate = check instanceof Date;
  if (!isDate && (check instanceof Object || check instanceof Array)) {
    return true;
  }

  return false;
};

/**
 * Converts a LocalDocument to object
 * @private
 * @param {Object} entries
 * @param {Array} select - an array of properties
 * @returns {Array} an array of filtered entries
 */
var selectFromEntries = function(entries, select) {
  return entries.map(function(entry) {
    var mapped = {};
    // Show only the fields in select
    for (var i = 0; i < select.length; i++) {
      mapped[select[i]] = entry[select[i]];
    }
    return mapped;
  });
};

/**
 * Checks an array for an object with key
 * @private
 * @param {Array} arr
 * @param {String} key
 * @param {String} keyword
 * @returns {Number} -1 if not found index if found
 */
var findInArray = function(arr, key, keyword) {
  var total = arr.length;
  for (var i = 0; i < total; i++) {
    if (arr[i][key] === keyword) {
      return i;
    }
  }
  return -1;
};
