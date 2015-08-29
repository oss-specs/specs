"use strict";

var path = require('path');

var getFeatureFilePaths = require('./getFeatureFilePaths');
var projectDataStorage = require('./projectDataStorage');

// Get a function for use with Array.prototype.map to
// convert file paths for feature files to express routes.
function pathsToRoutes(featureFileRoot) {
  return function(featurePath) {

    // Remove the filesystem root.
    featurePath = featurePath.replace(featureFileRoot, '');

    // Prefix with the 'features' route, always use backslashes.
    featurePath = path.posix.join('features', featurePath);

    return {
      featureRoute: featurePath,
      featureName: featurePath.replace('.feature', '').replace('features/', '')
    };
  }
}


/**
 * Takes an object of repo data and returns a promise for that
 * data decorated with feature file routes.
 *
 * Feature file routes are taken from disk via `getFeatureFilePaths`.
 *
 * @return A promise for the decorated data object.
 */
function deriveProjectData(featureFileRoot, repoData) {
  var projectData = {
    name: repoData.repoName,
    url: repoData.repoUrl,
    head: repoData.head,
    localName: repoData.localName,
    featureFilePaths: []
  }

  // Get the paths to the feature files.
  return getFeatureFilePaths(featureFileRoot)
    .then(function(featureFilePaths) {

      // Map from the storage directory to the Express route for creating links.
      projectData.featureFilePaths = featureFilePaths.map(pathsToRoutes(featureFileRoot));
      return projectData;
    });
}


/**
 * Return a function which takes the repo data, derives the project data and stores it.
 *
 * @return A promise for completion of the storage of the project data.
 */
function deriveAndStore(featureFileRoot) {
  return function(repoData) {
    return deriveProjectData(featureFileRoot, repoData)
      .then(projectDataStorage.persist);
  }
}

module.exports = {
  deriveAndStore: deriveAndStore
}
