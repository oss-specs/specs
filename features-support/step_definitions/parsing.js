"use strict";
/* eslint new-cap: 0 */

require('should');

var GherkinParser = require('../../lib/parser/gherkin.js');

module.exports = function() {
  // Shared variables
  var featureText;
  var parser;
  var visitor;
  var features;

  this.Given(/^the feature file\.?$/, function (string, done) {
    featureText = string;
    done();
  });

  this.When(/^I parse this specification\.?$/, function (done) {
    parser = new GherkinParser();
    visitor = parser.parse(featureText);
    features = visitor.getFeatures();
    done();
  });

  this.Then(/^I get a feature with title "([^"]*)"\.?$/, function (featureTitle, done) {
    features[0].name.should.be.exactly(featureTitle);
    done();
  });

  this.Then(/^scenarios with titles$/, function (table, done) {
    for(var i = 0; i < table.raw().length; i++) {
      var row = table.raw()[i];
      var scenario = features[0].scenarios[i];
      scenario.name.should.be.exactly(row[0]);
    }
    done();
  });

  this.Then(/^features tags are associated with features\.?$/, function (table, done) {
    var featureTags = features[0].tags;
    var expectedTags = (table.raw()).map(function (valueWrappedInArray) {return valueWrappedInArray[0]});
    featureTags.should.containDeepOrdered(expectedTags);
    done();
  });

  this.Then(/^scenario tags are associated with scenarios\.?$/, function (table, done) {
    var scenarioTags = features[0].scenarios[0].tags;
    var expectedTags = (table.raw()).map(function (valueWrappedInArray) {return valueWrappedInArray[0]});
    scenarioTags.should.containDeepOrdered(expectedTags);
    done();
  });
};
