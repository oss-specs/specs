/**
 * Functionality around tags in feature files.
 */
'use strict';

var countScenarios = require('./count-scenarios');

module.exports = {
  countProjectTags: countProjectTags,
  filterFeaturesAndScenarios: filterFeaturesAndScenarios
};


/**
 * Add tags to the tag counting object.
 * @param Object tagsCount            The tag counting object.
 * @param Object tagContainingObject  The object containing the tags to be counted.
 * @param Number increment            The amount to increment the tag count by.
 */
function addTags(tagsCount, tagContainingObject, increment, requestedTag) {
  var tags;
  if (typeof increment !== 'number') {
    throw new TypeError('Please provide a number to increment the tag count by.');
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
  var numScenarios = countScenarios(featureData);

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

/**
 * Count the tags in a project.
 * @param  {Object} projectData     Project data object.
 * @param  {Object} projectTags     Objcet for gathering information about the tags.
 * @param  {String} currentTagName  The requested current tag name to filter by.
 * @return {Array}                  The modified projectData and projectTags objects.
 */
function countProjectTags(projectData, projectTags, currentTagName) {
  var tagNames = [];

  projectTags = projectTags || {};

  // Count the tags in the project.
  projectData.files.forEach(function(file) {
    if (!file.isFeatureFile || file.error) {
      return;
    }

    // This counts tags and marks when an
    // object contains the requested tag.
    projectTags = count(file.data, projectTags, currentTagName);
  });
  tagNames = Object.keys(projectTags);
  projectData.hasTags = !!tagNames.length;

  // Mark the currently requested tag if any,
  // this is used to set the selected option
  // in the tag select box.
  tagNames.forEach(function(name) {
    // Currently on one tag is passed in the query parameter.
    if (name === currentTagName) {
      projectTags[name].isCurrent = true;
    }
  });
  projectData.tags = projectTags;

  return [projectData, projectTags];
}

/**
 * Applying filtering based on tags.
 * @param  {Object} projectData     Project data object.
 * @param  {Object} projectTags     Objcet for gathering information about the tags.
 * @param  {String} currentTagName  The requested current tag name to filter by.
 * @return {Array}                  The modified projectData and projectTags objects.
 */
function filterFeaturesAndScenarios(projectData, projectTags, currentTagName) {

  // Count the project tags and mark the current
  // tag of interest if there is one.
  let ret = countProjectTags(projectData, projectTags, currentTagName);
  projectData = ret[0];
  projectTags = ret[1];

  // Filter the features and scenarios based on
  // whether they contain the requested tag.
  if (currentTagName) {
    projectData.files = projectData.files.filter(function(file) {
      var feature;
      var featureScenarioContainsTag = false;

      // Filter out non-feature or erroring files.
      if (!file.isFeatureFile || file.error) {
        return false;
      }

      // If the FEATURE contains the tag keep it and take no further action.
      feature = file.data;
      if (feature.containsRequestedTag) {
        return true;
      }

      // Decide whether to filter a scenario based on whether it or a child
      // object has the requested tag.
      feature.scenarioDefinitions.forEach(function (scenario, index, defs) {

        // if any example contains the tag keep all examples.
        if (scenario.type === 'ScenarioOutline') {
          scenario.examples.forEach(function(example) {
            if (example.containsRequestedTag) {
              scenario.containsRequestedTag = true;
            }
          });
        }
        if (scenario.containsRequestedTag) {
          featureScenarioContainsTag = true;
        } else {
          // Set the scenario to undefined so it won't be rendered.
          defs[index] = undefined;
        }
      });

      // Remove undefined scenarios because handlbars' `each`
      // helper doen't ignore undefined array elements.
      feature.scenarioDefinitions = feature.scenarioDefinitions.filter(function(scenario) { return scenario !== undefined; });

      // Retain or lose the feature depending on whether a scenario
      // contained the requested tag.
      return featureScenarioContainsTag;
    });
  }

  return [projectData, projectTags];
}
