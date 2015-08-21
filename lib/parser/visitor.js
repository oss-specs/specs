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
    scenario_outline: function(keyword, name, description, line) {
      // TODO
      console.log('*** Scenario Outline');
      console.log('keyword:' + keyword);
      console.log('name:' + name);
      console.log('description:' + description);

    },
    examples: function(keyword, name, description, line) {
      // TODO
      console.log('*** Examples');
      console.log('keyword:' + keyword);
      console.log('name:' + name);
      console.log('description:' + description);

    },
    step: function(keyword, name, line) {
      var feature = features.getLatest();

      if (feature === undefined) {
          throw new TypeError(keyword + ' found outside of feature, giving up parsing.');
      }

      feature.addStep({
        keyword: keyword,
        name: name,
        line: line
      });
    },
    doc_string: function(content_type, string, line) {
      // TODO
      console.log('*** Doc String');
      console.log('content type:' + content_type);
      console.log('string:' + string);
    },
    row: function(row, line) {
      // TODO
      console.log('*** Row');
      console.log('row:' + row);
    },
    eof: function() {
      // TODO: is this important?
      console.log('*** EOF');
    },
    getFeatures: function() {
      return features;
    }
  };
}
