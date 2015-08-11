"use strict";
/* eslint new-cap: 0 */

require('should');

var GherkinParser = require('../../lib/parser/gherkin.js');

module.exports = function() {
  // Shared variables
  var featureText;
  var features;

  this.Given(/^the feature file\.?$/, function (string) {
    featureText = string;
  });

  this.When(/^I parse this specification\.?$/, function () {
    var parser = new GherkinParser();
    var visitor = parser.parse(featureText);
    features = visitor.getFeatures();
  });

  this.Then(/^I get a feature with title "([^"]*)"\.?$/, function (featureTitle) {
    features[0].name.should.be.exactly(featureTitle);
  });

  this.Then(/^scenarios with titles$/, function (table) {
    for(var i = 0; i < table.raw().length; i++) {
      var row = table.raw()[i];
      var scenario = features[0].scenarios[i];
      scenario.name.should.be.exactly(row[0]);
    }
  });

  this.Then(/^features tags are associated with features\.?$/, function (table) {
    var featureTags = features[0].tags;
    var expectedTags = (table.raw()).map(function (valueWrappedInArray) {return valueWrappedInArray[0]});
    featureTags.should.containDeepOrdered(expectedTags);
  });

  this.Then(/^scenario tags are associated with scenarios\.?$/, function (table) {
    var scenarioTags = features[0].scenarios[0].tags;
    var expectedTags = (table.raw()).map(function (valueWrappedInArray) {return valueWrappedInArray[0]});
    scenarioTags.should.containDeepOrdered(expectedTags);
  });

  this.Then(/^comments have been captured\.?$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });
};
