"use strict";

var getProjectUsingGit = require('./getProjectUsingGit');

/**
 * Get a copy of the project.
 *
 * @return a promise for the completion of the operation.
 */
module.exports = function getProject(repoUrl) {
  var repoName = /\/([^\/]+?)(?:\.git)?\/?$/.exec(repoUrl);
  repoName = (repoName && repoName.length ? repoName[1] : false);
  if (!repoName) throw new TypeError("Could not determine repository name.");

  return getProjectUsingGit(repoUrl, repoName);
};
