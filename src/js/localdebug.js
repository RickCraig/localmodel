'use strict';

/**
 * LocalDebug constructor
 */
var LocalDebug = function(options) {
  this.options = options || {};
  this.options.enabled = options.enabled || false;
};

/**
 * Simple logging
 * @private
 */
LocalDebug.prototype.log = function() {
  if (!this.options.enabled) { return; }
  console.log('[LocalModel]', arguments);
};
