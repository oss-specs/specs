'use strict';
/* eslint camelcase: 0 */

function Step(config) {
  this.token = 'step';
  this.keyword = config.keyword;
  this.name = config.name;
  this.line = config.line;
}

function ScenarioOrBackground(config) {
  this.steps = [];
  this.token = config.keyword.toLowerCase();
  this.keyword = config.keyword;
  this.name = config.name;
  this.description = config.description;
  this.line = config.line;
  this.tags = config.tags;
  this.comments = config.comments;
}

ScenarioOrBackground.prototype.addStep = function(config) {
  this.steps.push(new Step(config));
}

module.exports = function(config) {
  return new ScenarioOrBackground(config);
}
