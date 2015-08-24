'use strict';
/* eslint camelcase: 0 */

var stepFactory = require('./stepFactory');
var exampleFactory = require('./exampleFactory');

function ScenarioOrBackground(config) {

  // Data specificed when the scenario is created.
  this.token = config.keyword.toLowerCase();
  this.keyword = config.keyword;
  this.name = config.name;
  this.description = config.description;
  this.line = config.line;

  // Objects belonging to the scenario and added at creation time.
  this.tags = config.tags;
  this.comments = config.comments;

  // Objects belonging to the scenario and added after creation time.
  this.steps = [];
  this.examples = [];
}

ScenarioOrBackground.prototype.addStep = function(config) {
  this.steps.push(stepFactory(config));
}

ScenarioOrBackground.prototype.addExample = function(config) {
  this.examples.push(exampleFactory(config));
}

module.exports = function(config) {
  return new ScenarioOrBackground(config);
}
