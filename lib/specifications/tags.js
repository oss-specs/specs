/**
 * Functionality around tags in feature files.
 */
'use strict';

/**
 * Add tags to the tag counting object.
 * @param Object tagsCount   The tag counting object.
 * @param Array tags         Array of tags on the current object (e.g. feature, scenario).
 * @param Number increment   The amount to increment the tag count by.
 */
function addTags(tagsCount, tags, increment) {
  if (typeof increment !== "number") {
    throw new TypeError("Please provide a number to increment the tag count by.");
  }

  // Add each tag.
  tags.forEach(function(tag) {
    // Strip leading '@'.
    var name = tag.name.replace(/^@/, '');
    var urlEncodedName = encodeURIComponent(name);

    if (tagsCount[name]) {
      tagsCount[name].count += increment || 0;
    } else {
      tagsCount[name] = {
        count: increment || 0,
        urlEncodedName: urlEncodedName
      };
    }
  });
}

/**
 * Count Tags in a feature data structure.
 * @param  Object featureData    Data structure representing a feature.
 * @param  Object tagCountObject Object where keys are tag names.
 * @return Object tagCountObject Modified tagCountObject.
 */
function count(featureData, tagCountObject) {

  // Counting number of scenarios.
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

  // Counting feature tags.
  addTags(tagCountObject, featureData.tags, numScenarios);

  // Counting tags on scenario and scenario outlines.
  if (featureData.scenarioDefinitions.length) {
    featureData.scenarioDefinitions.forEach(function(scenario) {

      // Tags on scenarios.
      if (scenario.type === 'Scenario') {
        addTags(tagCountObject, scenario.tags, 1);
      }

      // Tags on scenario outlines.
      if (scenario.type === 'ScenarioOutline') {
        var examples = scenario.examples;
        var numExampleRows = 0;
        examples.forEach(function(example) {
          numExampleRows += example.tableBody.length || 0;
        });
        addTags(tagCountObject, scenario.tags, numExampleRows);

        // Tags on examples within scenario outlines.
        examples.forEach(function(example) {
          var numRows = example.tableBody.length || 0;
          addTags(tagCountObject, example.tags, numRows);
        });
      }
    });
  }

  return tagCountObject;
}

module.exports = {
  count: count
};
