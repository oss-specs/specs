"use strict";

var path = require('path');

var getProjectUsingGit = require('./getProjectUsingGit');
var projectMetaData = require('./projectMetaData');


// TODO: Remove magic knowledge of where feature files are, injection?
var featureFileRoot = path.join(__dirname, '..', '..', 'public', 'feature-files');

/**
 * Get a copy of the project, derive metadata, store metadata.
 *
 * @return a promise for the completion of repo metadata storage.
 */
function getProject(repoUrl) {
  var repoName = /\/([^\/]+?)(?:\.git)?\/?$/.exec(repoUrl);
  repoName = (repoName && repoName.length ? repoName[1] : false);
  if (!repoName) {
    throw new TypeError("Could not determine repository name.");
  }

  // Path for local cloning.
  var localName = path.join(featureFileRoot, repoName);

  // Clone or update the repo then derive and store the project metadata.
  return getProjectUsingGit(repoUrl, repoName, localName)
    .then(projectMetaData.deriveAndStore(featureFileRoot));
};


/**
 * Update a project.
 *
 * @return a promise for the completion of repo metadata storage.
 */
function updateProject(projectName) {
  return projectMetaData.getByName(projectName)
    .then(function (metadata) {
      if(!metadata) {
        throw new Error ("No metadata available for this project name: " + projectName);
      }
      var repoUrl = metadata.scmUrl;
      var repoName = metadata.repoName
      var localName = metadata.localName;

      // Update the repo then derive and store the project metadata.
      return getProjectUsingGit(repoUrl, repoName, localName)
        .then(projectMetaData.deriveAndStore(featureFileRoot));
    })
}

module.exports = {
  get: getProject,
  update: updateProject
};
