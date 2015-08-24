'use strict';
/* eslint camelcase: 0 */

var scenarioOrBackgroundFactory = require('./scenarioOrBackgroundFactory');

function Feature(config) {
  this.token = 'feature';

  /**
   * The scenarios list contains backgrounds, scenarios and scenario outlines.
   */
  var scenarios = this.scenarios = [];
  scenarios.getLatest = function() { return this[this.length - 1]; };
  scenarios.getScenarioOutlines = function() {
    return this.filter(function(scenario) {return scenario.token === 'scenario outline';});
  };
  scenarios.getLatestScenarioOutline = function() {
    var outlines = this.getScenarioOutlines();
    return outlines[outlines.length -1];
  };

  this.keyword = config.keyword;
  this.name = config.name;
  this.description = config.description;
  this.line = config.line;
  this.tags = config.tags;
  this.comments = config.comments;
};

Feature.prototype.addScenarioOrBackground = function(config) {
  this.scenarios.push(scenarioOrBackgroundFactory(config));
};

Feature.prototype.addStep = function(config) {
  var currentScenario = this.scenarios.getLatest();
  currentScenario.addStep(config);
};

Feature.prototype.addExample = function(config) {
  var currentScenarioOutline = this.scenarios.getLatestScenarioOutline();
  currentScenarioOutline.addExample(config);
};

// Export the feature factory.
module.exports = function(config) {
  return new Feature(config);
}
