"use strict";

var path = require('path');

var Q = require('q');

var getFeatureFilePaths = require('./getFeatureFilePaths');
var projectDataStorage = require('./projectDataStorage');

// Get a function for use with Array.prototype.map to
// convert file paths for feature files to express routes.
function pathsToRoutes(featureFileRoot, projectName) {
  return function(featurePath) {

    // Remove the filesystem root and the project name
    var pathRoot = path.posix.join(featureFileRoot, projectName) + '/';
    featurePath = featurePath.replace(pathRoot, '');

    return {
      featureRoute: featurePath,
      featureName: featurePath.replace('.feature', '')
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
    scmUrl: repoData.repoUrl,
    commit: repoData.commit,
    shortCommit: repoData.shortCommit,
    localName: repoData.localName,
    projectLink: '/' + repoData.repoName,
    featureFilePaths: []
  }

  // Get the paths to the feature files.
  return getFeatureFilePaths(featureFileRoot)
    .then(function(featureFilePaths) {

      // Map from the storage directory to the Express route for creating links.
      projectData.featureFilePaths = featureFilePaths.map(pathsToRoutes(featureFileRoot, projectData.name));
      return projectData;
    });
}


/**
 * Return a function which takes the repo data, derives the project data and stores it.
 *
 * @return A promise for the project data on completion of the storage.
 */
function deriveAndStore(featureFileRoot) {
  return function(repoData) {
    return deriveProjectData(featureFileRoot, repoData)
      .then(projectDataStorage.persist);
  }
}

/**
 * Get the meta data for a single project from a path.
 *
 * @return a promise for the meta data for one project.
 */
function getByPath(path) {
  return projectDataStorage.get(path);
}

/**
 * Get the meta data for a single project from a name.
 *
 * @return a promise for the meta data for one project.
 */
function getByName(name) {
  return projectDataStorage.getPath(name)
    .then(function(path) {
      if (path) {
        return projectDataStorage.get(path);
      } else {
        return false;
      }
    });
}


/**
 * Get the meta data for all projects.
 *
 * @return a promise for an array meta data for all the projects.
 */
function getAll() {
  return projectDataStorage.getPaths()
    .then(function(paths) {

      // TODO: POSSIBLE FEATURE. If there are no names, reparse the repos for project data.

      var promisesForData = paths.map(function(path) {
        return getByPath(path);
      });

      // Convert to promise for array of values.
      return Q.all(promisesForData);
    });
}

module.exports = {
  deriveAndStore: deriveAndStore,
  getAll: getAll,
  getByName: getByName
}
