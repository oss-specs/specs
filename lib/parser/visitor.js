'use strict';
/* eslint camelcase: 0 */

var featureFactory = require('./featureModels/featureFactory');
var tagsFactory = require('./featureModels/tagsFactory.js');

module.exports = function Visitor() {
  // TODO: remove underscores.
  var __features = [];
  var tags = tagsFactory();

  return {
    comment: function(value, line) {
    },
    tag: function(value, line) {
      tags.add(value);
    },
    feature: function(keyword, name, description, line) {
      var featureTags = tags.flush();
      __features.push(featureFactory(keyword, name, description, line, featureTags));
    },
    background: function(keyword, name, description, line) {
    },
    scenario: function(keyword, name, description, line) {
      var scenarioTags = tags.flush();
      var feature = __features[__features.length - 1];
      if (feature === undefined) {
          throw new TypeError('Scenario found outside of feature, giving up parsing.');
      }

      feature.addScenario(keyword, name, description, line, scenarioTags);
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
      return __features;
    }
  };
}
