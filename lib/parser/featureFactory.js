'use strict';
/* eslint camelcase: 0 */

function Feature(keyword, name, description, line) {
  this.token = 'feature';
  this.keyword = keyword;
  this.name = name;
  this.description = description;
  this.line = line;
  this.scenarios = [];
  this.tags = [];
};

module.exports = function(keyword, name, description, line) {
  return new Feature(keyword, name, description, line);
}
