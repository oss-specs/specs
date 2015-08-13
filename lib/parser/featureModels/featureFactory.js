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

var scenarioOrBackgroundTokens = {
    background: 'background',
    scenario: 'scenario'
};

function ScenarioOrBackground(config, token) {
  this.token = token;
  this.keyword = config.keyword;
  this.name = config.name;
  this.description = config.description;
  this.line = config.line;
  this.tags = config.tags;
  this.comments = config.comments;
}

Feature.prototype.addScenario = function(config) {
  this.scenarios.push(new ScenarioOrBackground(config, scenarioOrBackgroundTokens['scenario']));
};

Feature.prototype.addBackground = function(config) {
  this.backgrounds.push(new ScenarioOrBackground(config, scenarioOrBackgroundTokens['background']));
};

// Export the feature factory.
module.exports = function(config) {
  return new Feature(config);
}
