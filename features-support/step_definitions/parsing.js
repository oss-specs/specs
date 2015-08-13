"use strict";
/* eslint new-cap: 0 */

require('should');

var GherkinParser = require('../../lib/parser/gherkin.js');

function unwrapSingleColumnTable(singleColumnTable) {
  return (singleColumnTable.raw()).map(function (valueWrappedInArray) {return valueWrappedInArray[0]});
}

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

  this.Then(/^a background with the title "([^"]*)"\.?$/, function (backgroundTitle) {
    features[0].backgrounds[0].name.should.be.exactly(backgroundTitle);
  });

  this.Then(/^scenarios with titles$/, function (table) {
    for(var i = 0; i < table.raw().length; i++) {
      var row = table.raw()[i];
      var scenario = features[0].scenarios[i];
      scenario.name.should.be.exactly(row[0]);
    }
  });

  function compareFeatureValues(key) {
    return function compare(table) {
      var featureValues = features[0][key];
      var expectedValues = unwrapSingleColumnTable(table);
      featureValues.should.containDeepOrdered(expectedValues);
    }
  }

  function compareScenarioValues(key) {
    return function compare(table) {
      var featureValues = features[0].scenarios[0][key];
      var expectedValues = unwrapSingleColumnTable(table);
      featureValues.should.containDeepOrdered(expectedValues);
    }
  }

  this.Then(/^feature tags are associated with features\.?$/, compareFeatureValues('tags'));

  this.Then(/^scenario tags are associated with scenarios\.?$/, compareScenarioValues('tags'));

  this.Then(/^feature comments are associated with features\.?$/, compareFeatureValues('comments'));

  this.Then(/^scenario comments are associated with scenarios\.?$/, compareScenarioValues('comments'));
};
