/**
 * Functionality around tags in feature files.
 */
'use strict';

function count(featureData, tagCountObject) {
  // Counting number of scenarios.
  var numScenarios = 0;
  featureData.scenarioDefinitions.forEach(function(scenario) {
    var examples;
    if (scenario.type === 'Scenario') {
      numScenarios++;
    }
    if (scenario.type === 'ScenarioOutline') {
      examples = scenario.examples;
      examples.forEach(function(example) {
        numScenarios += example.tableBody.length || 0;
      });
    }
  });

  // Counting feature tags.
  featureData.tags.forEach(function(tag) {
    if (tagCountObject[tag.name]) {
      tagCountObject[tag.name].count += numScenarios;
    } else {
      tagCountObject[tag.name] = {
        count: numScenarios
      };
    }
  });

  // Counting scenario tags.
  if (featureData.scenarioDefinitions.length) {
    featureData.scenarioDefinitions.forEach(function(scenario) {

      // Tags on scenarios.
      if (scenario.type === 'Scenario') {
        scenario.tags.forEach(function(tag) {
          if (tagCountObject[tag.name]) {
            tagCountObject[tag.name].count += 1;
          } else {
            tagCountObject[tag.name] = {
              count: 1
            };
          }
        });
      }

      // Tags on scenario outlines.
      if (scenario.type === 'ScenarioOutline') {
        var examples = scenario.examples;
        var numExampleRows = 0;
        examples.forEach(function(example) {
          numExampleRows += example.tableBody.length || 0;
        });
        scenario.tags.forEach(function(tag) {
          if (tagCountObject[tag.name]) {
            tagCountObject[tag.name].count += numExampleRows;
          } else {
            tagCountObject[tag.name] = {
              count: numExampleRows
            };
          }
        });

        // Tags on examples.
        examples.forEach(function(example) {
          example.tags.forEach(function(tag) {
            if (tagCountObject[tag.name]) {
              tagCountObject[tag.name].count += example.tableBody.length || 0;
            } else {
              tagCountObject[tag.name] = {
                count: example.tableBody.length || 0
              };
            }
          });
        });
      }
    });
  }

  return tagCountObject;
}

module.exports = {
  count: count
};
