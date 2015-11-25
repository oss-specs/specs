'use strict';
/* eslint new-cap: 0 */

require('should');
var path = require('path');
var fs = require('fs');

var Gherkin = require('gherkin');
var Parser = new Gherkin.Parser();

function unwrapSingleColumnTable(singleColumnTable) {
  return (singleColumnTable.raw()).map(function (valueWrappedInArray) {return valueWrappedInArray[0];});
}

function firstRowFirstCell(table) {
  return table.raw()[0][0];
}

// Important because need to check that steps
// have been assigned to the correct scenario.
var scenarioNumberToIndex = {
  'default': 0,
  'first': 0,
  'second': 1,
  'third': 2,
  'fourth': 3
};

module.exports = function() {
  // Shared variables
  var featureText;
  var features;

  function compareFeatureValues(key) {
    return function compare(table) {
      var featureValues = features[key].map(function(a) {
        if(key === 'comments') {
          return a.text;
        }

        return a.name;
      });
      var expectedValues = unwrapSingleColumnTable(table);
      featureValues.should.containDeepOrdered(expectedValues);
    };
  }

  // TODO: FAR TOO COMPLICATED! Maybe remove the conditionals
  // TODO: by having two different functions. See Example tags scenario for a possible alternative.
  // key1 is a key on the scenario
  // key2 is an optional key on a sub-object.
  function compareScenarioValues(key1, key2) {
    return function compare(scenarioNumber, table) {
      var done;

      /**
       * Sometimes just a table is passed in the first argument slot,
       * in that case adjust the parameters.
       *
       * CucumberJS determines if the step definition completion
       * should be dependent on a callback by counting the number
       * of arguments, so we have to cope with that.
       **/
      if (typeof scenarioNumber === 'object') {
        done = table;
        table = scenarioNumber;
        scenarioNumber = 'default';
      }

      var scenarioIndex = scenarioNumberToIndex[scenarioNumber];
      var scenario = features.scenarioDefinitions[scenarioIndex];
      var scenarioValues;

      // If the suboject key is specified dig the values out of the objects
      // e.g. get the names of steps out of an array of steps.
      // c.f. https://lodash.com/docs#pluck .
      if (key2) {
        scenarioValues = scenario[key1].map(function(subObject) { return subObject[key2]; });
      } else {
        scenarioValues = scenario[key1];
      }


      var expectedValues = unwrapSingleColumnTable(table);

      // Do the test.
      scenarioValues.should.containDeepOrdered(expectedValues);

      if (typeof done === 'function') {
        done();
      }
    };
  }

  // Get scenarios etc and properties of such.
  function getScenarios(feature, tokenType) {
    tokenType = tokenType || 'Scenario';
    return feature.scenarioDefinitions
      .filter(function(scenario) {return scenario.type === tokenType;});
  }
  function getScenarioOutlines(feature) {
    return getScenarios(feature, 'ScenarioOutline');
  }
  function getScenarioNames(feature, tokenType) {
    return getScenarios(feature, tokenType)
      .map(function(scenario) {return scenario.name;});
  }

  this.Given(/^an example feature file\.?$/, function () {
    var exampleFeatureFilePath = path.join(__dirname, '..', 'test-data', 'example-feature-file.feature');
    featureText = fs.readFileSync(exampleFeatureFilePath, {encoding: 'utf8'});
  });

  this.When(/^I parse this specification\.?$/, function () {
    features = Parser.parse(featureText);
  });

  this.Then(/^I get a feature with title "([^"]*)"\.?$/, function (featureTitle) {
    features.name.should.be.exactly(featureTitle);
  });

  this.Then(/^I get a background with the title "([^"]*)"\.?$/, function (backgroundTitle) {
    var backgroundNames = features.background.name;
    backgroundNames.should.containEql(backgroundTitle);
  });

  this.Then(/^I get scenarios with titles\.?$/, function (table) {
    var expectedScenarioNames = unwrapSingleColumnTable(table);
    var scenarioNames = getScenarioNames(features, 'Scenario');
    scenarioNames.should.containDeep(expectedScenarioNames);
  });

  this.Then(/^I get a scenario outline with the title "([^"]*)"\.?$/, function (scenarioOutlineTitle) {
    var scenarioOutlineNames = getScenarioNames(features, 'ScenarioOutline');
    scenarioOutlineNames.should.containEql(scenarioOutlineTitle);
  });

  this.Then(/^I get a set of examples with the title "([^"]*)"\.?$/, function (expectedExampleTitle) {
    var scenarioOutlines = getScenarioOutlines(features);
    var exampleTitle = scenarioOutlines[0].examples[0].name;
    exampleTitle.should.be.exactly(expectedExampleTitle);
  });

  this.Then(/^feature tags are associated with features\.?$/, compareFeatureValues('tags'));

  this.Then(/^scenario tags are associated with scenarios\.?$/, compareScenarioValues('tags', 'name'));

  this.Then(/^feature comments are associated with features\.?$/, compareFeatureValues('comments'));

  this.Then(/^the "([^"]*)" scenario has steps with the names\.?$/, compareScenarioValues('steps', 'text'));

  this.Then(/^example tags are associated with examples$/, function (table) {
    var expectedTagValues = unwrapSingleColumnTable(table);
    var scenarioOutlines = getScenarioOutlines(features);

    var exampleTagData = scenarioOutlines[0].examples[0].tags.map(function(a) {
      return a.name;
    });

    exampleTagData.should.containDeep(expectedTagValues);
  });

  this.Then(/^scenario outlines have example data\.?$/, function (table) {
    var expectedExampleDataValues = unwrapSingleColumnTable(table);
    var scenarioOutlines = getScenarioOutlines(features);

    var exampleDataValues = scenarioOutlines[0].examples[0].tableBody
      .map(function(row) { return row.cells.map(function(a) {
        return a.value;
      }); })
      .reduce(function(a, b) { return a.concat(b); });
    exampleDataValues.should.containDeep(expectedExampleDataValues);
  });

  this.Then(/^steps with tables have that table data\.?$/, function (table) {
    var expectedTableDataValues = unwrapSingleColumnTable(table);
    var scenarios = getScenarios(features);

    // Dig the relevant values out of the data structure.
    // TODO: too complicated, abstract or find another solution.
    var scenarioTableData = scenarios
    .map(function(scenario) {
      return scenario.steps
      .filter(function(step) {
        return step.argument && step.argument.type === 'DataTable';
      })
      .map(function(step) {
        return step.argument.rows.map(function(row) {
          return row.cells.map(function(cell) {
            return cell.value;
          });
        })
        .reduce(function(a, b) { return a.concat(b); }, []);
      }).reduce(function(a, b) { return a.concat(b); }, []);
    }).reduce(function(a, b) { return a.concat(b); }, []);

    scenarioTableData.should.containDeep(expectedTableDataValues);
  });

  this.Then(/^steps with doc strings have that doc string content\.?$/, function (table) {
    var expectedDocStringValues = firstRowFirstCell(table);
    var scenarios = getScenarios(features);

    // Dig the relevant values out of the data structure.
    // TODO: too complicated, abstract or find another solution.
    var scenarioDocStringData = scenarios
      .map(function(scenario) {
        return scenario.steps
          .filter(function(step) {
            return step.argument && step.argument.type === 'DocString';
          })
          .map(function(step) {
            return step.argument.content;
          });
      }).reduce(function(a, b) {
        return a.concat(b);
      })[0];


    scenarioDocStringData.should.match(expectedDocStringValues);
  });
};
