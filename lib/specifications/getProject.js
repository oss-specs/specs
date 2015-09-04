"use strict";

var path = require('path');

var getProjectUsingGit = require('./getProjectUsingGit');
var deriveAndStoreProjectMetaData = require('./projectMetaData').deriveAndStore;

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
    .then(deriveAndStoreProjectMetaData(featureFileRoot));
};

// var getProjectMetaData = require('../lib/specifications/projectMetaData').get;
function updateProject(projectName) {
  return new Promise(function(resolve, reject) {
    resolve(console.log(projectName));
  });
  // if name doesn't exist in meta data throw an error.
  // derive the local name.
  // call the getProjectUsingGit function.
}

module.exports = {
  get: getProject,
  update: updateProject
};
