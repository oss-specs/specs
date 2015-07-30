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

  this.Given(/^the feature$/, function (string) {
    featureText = string;
  });

  this.When(/^I parse this specification$/, function () {
    parser = new GherkinParser();
    visitor = parser.parse(featureText);
    features = visitor.getFeatures();
  });

  this.Then(/^I get a feature with title "([^"]*)"$/, function (featureTitle) {
    features[0].name.should.be.exactly(featureTitle);
  });

  this.Then(/^scenarios with titles$/, function (table) {
    for(var i = 0; i < table.raw().length; i++) {
      var row = table.raw()[i];
      var scenario = features[0].scenarios[i];
      scenario.name.should.be.exactly(row[0]);
    }
  });
};
