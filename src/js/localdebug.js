'use strict';

/**
 * LocalDebug constructor
 */
var LocalDebug = function(options) {
  this.options = options || {};
  this.options.enabled = options.enabled || false;
};

/**
 * Start point for a profile
 * @private
 * @param {String} name
 */
LocalDebug.prototype.start = function(name) {
  if (!this.options.enabled) { return; }
  console.time(name);
};

/**
 * End point for a profile
 * @private
 * @param {String} name - should match the relevant start name
 */
LocalDebug.prototype.end = function(name) {
  if (!this.options.enabled) { return; }
  console.timeEnd(name);
};

/**
 * Simple logging
 * @private
 */
LocalDebug.prototype.log = function() {
  if (!this.options.enabled) { return; }
  console.log('[LocalModel]', arguments);
};
