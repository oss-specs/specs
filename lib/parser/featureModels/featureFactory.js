'use strict';
/* eslint camelcase: 0 */

// TODO: replace parameter lists with objects.

function Feature(keyword, name, description, line, tags) {
  this.token = 'feature';
  this.keyword = keyword;
  this.name = name;
  this.description = description;
  this.line = line;
  this.scenarios = [];
  this.tags = tags;
};

function Scenario(keyword, name, description, line, tags) {
  this.token = 'scenario';
  this.keyword = keyword;
  this.name = name;
  this.description = description;
  this.line = line;
  this.tags = tags;
}

Feature.prototype.addScenario = function(keyword, name, description, line, tags) {
  this.scenarios.push(new Scenario(keyword, name, description, line, tags));
};

// Export the feature factory.
module.exports = function(keyword, name, description, line, tags) {
  return new Feature(keyword, name, description, line, tags);
}
