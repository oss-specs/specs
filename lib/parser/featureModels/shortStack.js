/**
 * A made-up data structure like a stack but the only
 * way to get values out is to get all of them and
 * remove all stored values.
 */

'use strict';
/* eslint camelcase: 0 */

function ShortStack() {
  this.values = [];
}

ShortStack.prototype.add = function(value) {
  this.values.push(value);
}

ShortStack.prototype.flush = function() {
  var values;
  values = this.values;
  this.values = [];
  return values;
}

module.exports = ShortStack;
