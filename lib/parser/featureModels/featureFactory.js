'use strict';
/* eslint camelcase: 0 */

function Feature(config) {
  this.token = 'feature';
  this.backgrounds = [];
  this.scenarios = [];
  this.keyword = config.keyword;
  this.name = config.name;
  this.description = config.description;
  this.line = config.line;
  this.tags = config.tags;
  this.comments = config.comments;
};

function ScenarioOrBackground(config, token) {
  this.token = config.keyword.toLowerCase();
  this.keyword = config.keyword;
  this.name = config.name;
  this.description = config.description;
  this.line = config.line;
  this.tags = config.tags;
  this.comments = config.comments;
}

Feature.prototype.addScenarioOrBackground = function(config) {
  var key = config.keyword.toLowerCase() + 's';
  this[key].push(new ScenarioOrBackground(config));
};

// Export the feature factory.
module.exports = function(config) {
  return new Feature(config);
}
