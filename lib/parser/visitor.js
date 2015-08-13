'use strict';
/* eslint camelcase: 0 */

var featureFactory = require('./featureModels/featureFactory');
var tagsFactory = require('./featureModels/tagsFactory.js');
var commentsFactory = require('./featureModels/commentsFactory.js');

module.exports = function Visitor() {
  var features = [];
  var tags = tagsFactory();
  var comments = commentsFactory();

  return {
    comment: function(value, line) {
      comments.add(value);
    },
    tag: function(value, line) {
      tags.add(value);
    },
    feature: function(keyword, name, description, line) {

      // Add the current list of tags to the current feature and empty the tags list.
      var featureTags = tags.flush();
      var featureComments = comments.flush();
      features.push(featureFactory({
        keyword: keyword,
        name: name,
        description: description,
        line: line,
        tags: featureTags,
        comments: featureComments
      }));
    },
    background: function(keyword, name, description, line) {
      var backgroundTags = tags.flush();
      var backgroundComments = comments.flush();

      var feature = features[features.length - 1];
      if (feature === undefined) {
          throw new TypeError('Background found outside of feature, giving up parsing.');
      }

      feature.addBackground({
        keyword: keyword,
        name: name,
        description: description,
        line: line,
        tags: backgroundTags,
        comments: backgroundComments
      });
    },
    scenario: function(keyword, name, description, line) {
      var scenarioTags = tags.flush();
      var scenarioComments = comments.flush();

      var feature = features[features.length - 1];
      if (feature === undefined) {
          throw new TypeError('Scenario found outside of feature, giving up parsing.');
      }

      feature.addScenario({
        keyword: keyword,
        name: name,
        description: description,
        line: line,
        tags: scenarioTags,
        comments: scenarioComments
      });
    },
    scenario_outline: function(keyword, name, description, line) {
    },
    examples: function(keyword, name, description, line) {
    },
    step: function(keyword, name, line) {
    },
    doc_string: function(content_type, string, line) {
    },
    row: function(row, line) {
    },
    eof: function() {
    },
    getFeatures: function() {
      return features;
    }
  };
}
