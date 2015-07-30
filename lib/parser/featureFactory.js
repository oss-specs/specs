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

function Scenario(keyword, name, description, line) {
  this.token = 'scenario';
  this.keyword = keyword;
  this.name = name;
  this.description = description;
  this.line = line;
  this.tags = [];
}

Feature.prototype.addScenario = function(keyword, name, description, line) {
  this.scenarios.push(new Scenario(keyword, name, description, line));
};

// Export the feature factory.
module.exports = function(keyword, name, description, line) {
  return new Feature(keyword, name, description, line);
}
