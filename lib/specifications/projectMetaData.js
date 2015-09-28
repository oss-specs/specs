"use strict";

var path = require('path');
//var url = require('url');

var Q = require('q');

var fs = require('q-io/fs');

var lodashAssign = require('lodash.assign');
var getFeatureFilePaths = require('./getFeatureFilePaths');
var getRefInformation = require('./projectGitInteractions').getRefInformation;
var config = require('../configuration').get();

// Get a function for use with Array.prototype.map to
// convert file paths for feature files to express routes.
function pathsToRoutes(featureFileRoot, projectName, ref) {
  return function(featurePath) {
    // Remove the filesystem root and the project name
    // so that we have URLs relative the project page.

    var pathRoot = path.posix.join(featureFileRoot, projectName) + '/';
    var featureRoute = featurePath.replace(pathRoot, '');

    // Remove the .feature for a slightly shorter display name.
    var featureName = featureRoute.replace('.feature', '').replace('.md', '');

    var featureNameShort = featureName.replace(/.+[\/\\]/, '');

    return {
      featureRoute: featureRoute,
      featureName: featureName,
      featureNameShort: featureNameShort,
      ref: ref
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

  // Copy values from repoData to projectData
  // if we did it by reference (JS default) then
  // we risk some weird bugs.
  var projectData = lodashAssign({}, repoData);

  projectData.repoName = repoData.repoName;
  projectData.projectLink = url.resolve('project/', repoData.repoName);
  projectData.featureFilePaths = [];


  // Get the paths to the feature files.
  return getFeatureFilePaths(projectData)
    .then(function(featureFilePaths) {
      // Map from the storage directory to the Express route for creating links.
      projectData.featureFilePaths = featureFilePaths.map(pathsToRoutes(featureFileRoot, projectData.repoName));
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
    return deriveProjectData(featureFileRoot, repoData);
  }
}

// /**
//  * Get the meta data for a single project from a path.
//  *
//  * @return a promise for the meta data for one project.
//  */
// function getByPath(path) {
//   return false;
// }

/**
 * Get the meta data for a single project from a name.
 *
 * @return a promise for the meta data for one project.
 */
function getByName(projectData) {
  return getRefInformation(projectData, projectData.currentBranchName);
}


/**
 * Get the meta data for all projects.
 *
 * @return a promise for an array meta data for all the projects.
 */
function getAll() {
  return fs.list(config.projectsPath)
      .then(function(paths) {
        return paths.map(function(path) {
          return fs.base(path);
        })
      })
      .catch(function(error) {
        // If there are no sets of project data on file return an empty list.
        // Else, rethrow because an error wasn't expected.
        if (error.code !== "ENOENT") {
          throw error;
        }
        return [];
      });
}

module.exports = {
  deriveAndStore: deriveAndStore,
  getAll: getAll,
  getByName: getByName
}
