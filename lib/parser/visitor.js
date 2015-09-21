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
    comment: function(comment) {

      // DEBUG
      console.log("comment");

      comments.add(comment);
    },
    tag: function(tag) {

      // DEBUG
      console.log("tag");

      tags.add(tag);
    },
    feature: function(keyword, name, description, line) {

      // DEBUG
      console.log("feature");


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

      // DEBUG
      console.log("examples");

      var exampleTags = tags.flush();
      var latestFeature = features.getLatest();
      latestFeature.addExample({
        keyword: keyword,
        name: name,
        description: description,
        line: line,
        tags: exampleTags
      });
    },
    step: function(keyword, name, line) {

      // DEBUG
      console.log("step");

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

      // DEBUG
      console.log("doc string");

      var latestFeature = features.getLatest();
      latestFeature.addDocString({
        contentType: content_type,
        content: string,
        line: line
      });
    },
    row: function(row, line) {


        // DEBUG
        console.log("row");

      var latestFeature = features.getLatest();
      latestFeature.addRow({
        content: row,
        line: line
      });
    },
    eof: function() {


        // DEBUG
        console.log("eof");

      // TODO: is this important?
      // console.log('*** EOF');
    },
    getFeatures: function() {
      return features;
    }
  };
}
