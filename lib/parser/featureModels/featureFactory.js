'use strict';
/* eslint camelcase: 0 */

// TODO: replace parameter lists with objects.

function Feature(keyword, name, description, line, tags, comments) {
  this.token = 'feature';
  this.keyword = keyword;
  this.name = name;
  this.description = description;
  this.line = line;
  this.scenarios = [];
  this.tags = tags;
  this.comments = comments;
};

function Scenario(keyword, name, description, line, tags, comments) {
  this.token = 'scenario';
  this.keyword = keyword;
  this.name = name;
  this.description = description;
  this.line = line;
  this.tags = tags;
  this.comments = comments;
}

Feature.prototype.addScenario = function(keyword, name, description, line, tags, comments) {
  this.scenarios.push(new Scenario(keyword, name, description, line, tags, comments));
};

// Export the feature factory.
module.exports = function(keyword, name, description, line, tags, comments) {
  return new Feature(keyword, name, description, line, tags, comments);
}
