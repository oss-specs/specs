'use strict';
/* eslint camelcase: 0 */

var featureFactory = require('./featureModels/featureFactory');
var tagsFactory = require('./featureModels/tagsFactory.js');
var commentsFactory = require('./featureModels/commentsFactory.js');

module.exports = function Visitor() {
  var features = [];
  var tags = tagsFactory();
  var comments = commentsFactory();

  function backgroundOrScenarioParser(keyword, name, description, line) {
    var localTags = tags.flush();
    var localComments = comments.flush();

    var feature = features[features.length - 1];
    if (feature === undefined) {
        throw new TypeError(keyword + ' found outside of feature, giving up parsing.');
    }

    feature.addScenarioOrBackground({
      keyword: keyword,
      name: name,
      description: description,
      line: line,
      tags: localTags,
      comments: localComments
    });
  }

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
    background: backgroundOrScenarioParser,
    scenario: backgroundOrScenarioParser,
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
