'use strict';
/* eslint camelcase: 0 */

var stepFactory = require('./stepFactory');
var exampleFactory = require('./exampleFactory');

// Hack because Gherkin treats rows in Examples the
// same as rows in tables belonging to steps.
var exampleProcessedMostRecently = false;

// Covers scenarios, backgrounds and scenario outlines.
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
  exampleProcessedMostRecently = false;
  this.steps.push(stepFactory(config));
}

ScenarioOrBackground.prototype.addExample = function(config) {

  if (this.token !== 'scenario outline') {
    console.warn('Adding an example to a non Scenario Outline object.');
  }

  exampleProcessedMostRecently = true;
  this.examples.push(exampleFactory(config));
}

/**
 * Add a row, this can either belong to a step (data table) or
 * to an example.
 */
ScenarioOrBackground.prototype.addRow = function(config) {
  var latest = null;
  if (exampleProcessedMostRecently) {
    latest = this.examples[this.examples.length - 1];
  } else {
    latest = this.steps[this.steps.length - 1];
  }
  latest.addRow(config);
}

module.exports = function(config) {
  return new ScenarioOrBackground(config);
}
