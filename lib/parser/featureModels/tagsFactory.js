'use strict';
/* eslint camelcase: 0 */

function Tags() {
  this.tags = [];
}

Tags.prototype.add = function(tag) {
  this.tags.push(tag);
}

Tags.prototype.flush = function() {
  var tags;
  tags = this.tags;
  this.tags = [];
  return tags;
}

module.exports = function() {
  return new Tags();
};
