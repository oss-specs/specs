'use strict';
/* eslint camelcase: 0 */

function Example(config) {
  this.token = 'example';
  this.keyword = config.keyword;
  this.name = config.name;
  this.description = config.description;
  this.line = config.line;

  this.rows = [];
}

Example.prototype.addRow = function(config) {
  this.rows.push(config);
};

module.exports = function(config) {
  return new Example(config);
}
