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

// TODO: refactor these identical functions.
Feature.prototype.addStep = function(config) {
  var currentScenario = this.scenarios.getLatest();
  currentScenario.addStep(config);
};

Feature.prototype.addExample = function(config) {
  var currentScenario = this.scenarios.getLatest();
  currentScenario.addExample(config);
};

Feature.prototype.addRow = function(config) {
  var currentScenario = this.scenarios.getLatest();
  currentScenario.addRow(config);
};

Feature.prototype.addDocString = function(config) {
  var currentScenario = this.scenarios.getLatest();
  currentScenario.addDocString(config);
};

// Export the feature factory.
module.exports = function(config) {
  return new Feature(config);
}
