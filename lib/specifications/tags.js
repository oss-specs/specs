/**
 * Functionality around tags in feature files.
 */
'use strict';

/**
 * Add tags to the tag counting object.
 * @param Object tagsCount            The tag counting object.
 * @param Object tagContainingObject  The object containing the tags to be counted.
 * @param Number increment            The amount to increment the tag count by.
 */
function addTags(tagsCount, tagContainingObject, increment, requestedTag) {
  var tags;
  if (typeof increment !== "number") {
    throw new TypeError("Please provide a number to increment the tag count by.");
  }

  // Add each tag.
  tags = tagContainingObject.tags;
  tags.forEach(function(tag) {
    // Strip leading '@'.
    var tagName = tag.name.replace(/^@/, '');
    var urlEncodedName = encodeURIComponent(tagName);

    // If this object contains the requested tag then
    // mark it for later filtering.
    if (tagName === requestedTag) {
      tagContainingObject.containsRequestedTag = true;
    }

    if (tagsCount[tagName]) {
      tagsCount[tagName].count += increment || 0;
    } else {
      tagsCount[tagName] = {
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
 * @param  String requestedTag   The currently requested tag to filter on.
 * @return Object tagCountObject Modified tagCountObject.
 */
function count(featureData, tagCountObject, requestedTag) {

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
  addTags(tagCountObject, featureData, numScenarios, requestedTag);

  // Counting tags on scenario and scenario outlines.
  if (featureData.scenarioDefinitions.length) {
    featureData.scenarioDefinitions.forEach(function(scenario) {

      // Tags on scenarios.
      if (scenario.type === 'Scenario') {
        addTags(tagCountObject, scenario, 1, requestedTag);
      }

      // Tags on scenario outlines.
      if (scenario.type === 'ScenarioOutline') {
        var examples = scenario.examples;
        var numExampleRows = 0;
        examples.forEach(function(example) {
          numExampleRows += example.tableBody.length || 0;
        });
        addTags(tagCountObject, scenario, numExampleRows, requestedTag);

        // Tags on examples within scenario outlines.
        examples.forEach(function(example) {
          var numRows = example.tableBody.length || 0;
          addTags(tagCountObject, example, numRows, requestedTag);
        });
      }
    });
  }

  return tagCountObject;
}

module.exports = {
  count: count
};
