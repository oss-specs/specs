'use strict';
/* eslint camelcase: 0 */

function Feature(config) {
  this.token = 'feature';
  this.scenarios = [];
  this.keyword = config.keyword;
  this.name = config.name;
  this.description = config.description;
  this.line = config.line;
  this.tags = config.tags;
  this.comments = config.comments;
};

function Scenario(config) {
  this.token = 'scenario';
  this.keyword = config.keyword;
  this.name = config.name;
  this.description = config.description;
  this.line = config.line;
  this.tags = config.tags;
  this.comments = config.comments;
}

Feature.prototype.addScenario = function(config) {
  this.scenarios.push(new Scenario(config));
};

// Export the feature factory.
module.exports = function(config) {
  return new Feature(config);
}
