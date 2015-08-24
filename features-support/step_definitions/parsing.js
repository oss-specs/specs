"use strict";
/* eslint new-cap: 0 */

require('should');

var GherkinParser = require('../../lib/parser/gherkin.js');

function unwrapSingleColumnTable(singleColumnTable) {
  return (singleColumnTable.raw()).map(function (valueWrappedInArray) {return valueWrappedInArray[0]});
}

// Important because need to check that steps
// have been assigned to the correct scenario.
var scenarioNumberToIndex = {
  "background": 0,
  "default": 1,
  "first": 1,
  "second": 2,
  "third": 3,
  "fourth": 4
};

module.exports = function() {
  // Shared variables
  var featureText;
  var features;

  function compareFeatureValues(key) {
    return function compare(table) {
      var featureValues = features[0][key];
      var expectedValues = unwrapSingleColumnTable(table);
      featureValues.should.containDeepOrdered(expectedValues);
    }
  }

  // TODO: FAR TOO COMPLICATED! Maybe remove the conditionals
  // TODO: by having two different functions.
  // key1 is a key on the scenario
  // key2 is an optional key on a sub-object.
  function compareScenarioValues(key1, key2) {
    return function compare(scenarioNumber, table) {
      var done = undefined;

      /**
       * Sometimes just a table is passed in the first argument slot,
       * in that case adjust the parameters.
       *
       * CucumberJS determines if the step definition completion
       * should be dependent on a callback by counting the number
       * of arguments, so we have to cope with that.
       **/
      if (typeof scenarioNumber === "object") {
        done = table;
        table = scenarioNumber;
        scenarioNumber = "default";
      }

      var scenarioIndex = scenarioNumberToIndex[scenarioNumber];
      var scenario = features[0].scenarios[scenarioIndex];
      var scenarioValues;

      // If the suboject key is specified dig the values out of the objects.
      // e.g. get the names of steps out of an array of steps.
      // c.f. https://lodash.com/docs#pluck .
      if (key2) {
        scenarioValues = scenario[key1].map(function(subObject) {return subObject[key2]; });
      } else {
        scenarioValues = scenario[key1];
      }

      var expectedValues = unwrapSingleColumnTable(table);

      // Do the test.
      scenarioValues.should.containDeepOrdered(expectedValues);

      if (typeof done === "function") {
        done();
      }
    }
  }

  // Extract scenario names from scenario objects of types
  // 'scenario', 'background' or 'scenario outline'.
  function getScenarioNames(feature, tokenType) {
      tokenType = tokenType || 'scenario';
      return feature.scenarios
        .filter(function(scenario) {return scenario.token === tokenType;})
        .map(function(scenario) {return scenario.name});
  }

  function getScenarioOutlines(feature) {
    return feature.scenarios
      .filter(function(scenario) {return scenario.token === 'scenario outline';});
  }

  this.Given(/^the feature file\.?$/, function (string) {
    featureText = string;
  });

  this.When(/^I parse this specification\.?$/, function () {
    var parser = new GherkinParser();
    features = parser
      .parse(featureText)
      .getFeatures();
  });

  this.Then(/^I get a feature with title "([^"]*)"\.?$/, function (featureTitle) {
    features[0].name.should.be.exactly(featureTitle);
  });

  this.Then(/^I get a background with the title "([^"]*)"\.?$/, function (backgroundTitle) {
    var backgroundNames = getScenarioNames(features[0], 'background');
    backgroundNames.should.containEql(backgroundTitle);
  });

  this.Then(/^I get scenarios with titles\.?$/, function (table) {
    var expectedScenarioNames = unwrapSingleColumnTable(table);
    var scenarioNames = getScenarioNames(features[0], 'scenario');
    scenarioNames.should.containDeep(expectedScenarioNames);
  });

  this.Then(/^I get a scenario outline with the title "([^"]*)"\.?$/, function (scenarioOutlineTitle) {
    var scenarioOutlineNames = getScenarioNames(features[0], 'scenario outline');
    scenarioOutlineNames.should.containEql(scenarioOutlineTitle);
  });

  this.Then(/^I get a set of examples with the title "([^"]*)"\.?$/, function (expectedExampleTitle) {
    var scenarioOutlines = getScenarioOutlines(features[0]);
    var exampleTitle = scenarioOutlines[0].examples[0].name;
    exampleTitle.should.be.exactly(expectedExampleTitle);
  });

  this.Then(/^feature tags are associated with features\.?$/, compareFeatureValues('tags'));

  this.Then(/^scenario tags are associated with scenarios\.?$/, compareScenarioValues('tags'));

  this.Then(/^feature comments are associated with features\.?$/, compareFeatureValues('comments'));

  this.Then(/^scenario comments are associated with scenarios\.?$/, compareScenarioValues('comments'));

  this.Then(/^the "([^"]*)" scenario has steps with the names\.?$/, compareScenarioValues('steps', 'name'));

  this.Then(/^scenario outlines have example data$/, function (table) {
    var expectedExampleDataValues = unwrapSingleColumnTable(table);
    var scenarioOutlines = getScenarioOutlines(features[0]);
    var exampleDataValues = scenarioOutlines[0].examples[0].rows;
    exampleDataValues.should.containDeep(expectedExampleDataValues);
  });
};
