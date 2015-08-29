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
module.exports = function getProject(repoUrl) {
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
