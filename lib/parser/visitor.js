'use strict';
/* eslint camelcase: 0 */

var featureFactory = require('./featureModels/featureFactory');
var tagsFactory = require('./featureModels/tagsFactory.js');
var commentsFactory = require('./featureModels/commentsFactory.js');

module.exports = function Visitor() {
  var features = [];
  features.getLatest = function() { return this[this.length - 1]; };


  var tags = tagsFactory();
  var comments = commentsFactory();

  function backgroundOrScenarioParser(keyword, name, description, line) {
    var localTags = tags.flush();
    var localComments = comments.flush();

    var feature = features.getLatest();
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
    scenario_outline: backgroundOrScenarioParser,

    /**
     * Unlike tags or comments, steps and examples occur after
     * the scenario outline they belong to, so they
     * require a different approach.
     * Assumes things like steps and examples are intended to
     * belong to the most recent instance of whatever they
     * correctly belong to e.g. examples to scenario outlines.
     **/
    examples: function(keyword, name, description, line) {
      var latestFeature = features.getLatest();
      latestFeature.addExample({
        keyword: keyword,
        name: name,
        description: description,
        line: line
      });
    },
    step: function(keyword, name, line) {
      var latestFeature = features.getLatest();

      // Warn of really blaring syntax errors.
      if (latestFeature === undefined) {
          console.warn(keyword + ' found outside of feature, probably bad syntax.');
      }

      latestFeature.addStep({
        keyword: keyword,
        name: name,
        line: line
      });
    },
    doc_string: function(content_type, string, line) {
      // TODO
      // console.log('*** Doc String');
      // console.log('content type:' + content_type);
      // console.log('string:' + string);
    },
    row: function(row, line) {
      var latestFeature = features.getLatest();
      latestFeature.addRow({
        content: row,
        line: line
      });
    },
    eof: function() {
      // TODO: is this important?
      // console.log('*** EOF');
    },
    getFeatures: function() {
      return features;
    }
  };
}
