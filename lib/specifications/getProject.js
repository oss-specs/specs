"use strict";

var path = require('path');

var getProjectUsingGit = require('./getProjectUsingGit');
var getFeatureFilePaths = require('./getFeatureFilePaths');
var projectData = require('./projectData');

// TODO: Remove magic knowledge of where feature files are, again in memory config persistence needed.
var featureFileRoot = path.join(__dirname, '..', '..', 'public', 'feature-files');


/**
 * Get a copy of the project, derive metadata, store metadata.
 *
 * @return a promise for the completion of repo metadata storage.
 */
module.exports = function getProject(repoUrl) {
  var repoName = /\/([^\/]+?)(?:\.git)?\/?$/.exec(repoUrl);
  repoName = (repoName && repoName.length ? repoName[1] : false);
  if (!repoName) throw new TypeError("Could not determine repository name.");

  // Clone or update the repo...
  return getProjectUsingGit(repoUrl, repoName)

    // ... and get info about it.
    .then(function getProjectData(repoData) {
      var projectData = {
        name: repoName,
        url: repoUrl,
        head: repoData.head,
        localName: repoData.localName
      }

      // Get the paths to the feature files etc to
      // decorate the project data object with.
      return getFeatureFilePaths(featureFileRoot)
        .then(function(featureFilePaths) {

          // Map from the storage directory to the Express route for creating links.
          featureFilePaths = featureFilePaths.map(function(featurePath) {
            featurePath = featurePath.replace(featureFileRoot, 'features/');
            return {
              featurePath: featurePath,
              featureName: featurePath.replace('.feature', '').replace('features/', '')
            };
          });

          projectData.featureFilePaths = featureFilePaths;
          return projectData;
        });
    })

    // Then persist the metadata!
    .then(projectData.persist);
};
