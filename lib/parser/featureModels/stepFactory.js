'use strict';
/* eslint camelcase: 0 */

function Step(config) {
  this.token = 'step';
  this.keyword = config.keyword;
  this.name = config.name;
  this.line = config.line;

  this.rows = [];
  this.docStrings = [];
}

Step.prototype.addRow = function(config) {
  this.rows.push(config);
};

Step.prototype.addDocString = function(config) {
  this.docStrings.push(config);
};

module.exports = function(config) {
  return new Step(config);
}
