/**
 * Count scenarios in a feature file.
 */
'use strict';

module.exports = function countScenarios(featureData) {
  var numScenarios = 0;
  featureData.scenarioDefinitions.forEach(function(scenario) {
    if (scenario.type === 'Scenario') {
      numScenarios++;
    }
    if (scenario.type === 'ScenarioOutline') {
      var examples = scenario.examples;
      examples.forEach(function(example) {
        numScenarios += example.tableBody.length || 0;
      });
    }
  });

  return numScenarios;
};
