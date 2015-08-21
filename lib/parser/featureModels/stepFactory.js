'use strict';
/* eslint camelcase: 0 */

function Step(config) {
  this.token = 'step';
  this.keyword = config.keyword;
  this.name = config.name;
  this.line = config.line;
}

module.exports = function(config) {
  return new Step(config);
}
