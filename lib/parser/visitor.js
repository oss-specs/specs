"use strict";
/* eslint camelcase: 0 */

var featureFactory = require('./featureFactory');

function Visitor() {
  var __features = [];
  var inScenario = false;

  return {
    comment: function(value, line) {
    },
    tag: function(value, line) {
    },
    feature: function(keyword, name, description, line) {
      inScenario = false;

      // TODO handle tags in constructor.
      // They belong to a feature but happen before it "starts".
      __features.push(featureFactory(keyword, name, description, line));
    },
    background: function(keyword, name, description, line) {
    },
    scenario: function(keyword, name, description, line) {
      inScenario = true;

      var feature = __features[__features.length - 1];
      if (feature === undefined) {
          throw new TypeError('Scenario found outside of feature, giving up parsing.');
      }

      feature.addScenario(keyword, name, description, line);
    },
    scenario_outline: function(keyword, name, description, line) {
      inScenario = true;
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

module.exports = Visitor;
