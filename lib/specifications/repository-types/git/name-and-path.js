/**
 * Functionality related to deriving data from a Git repo URL.
 */
'use strict';

var path = require('path');

module.exports = {
  getNameAndPath: getNameAndPath
};

// Generate the repo name from the repo URL and therefore the local path
// to the repo.
function getNameAndPath (projectData) {
  var repoName;
  var localPath;

  if (!projectData.localPathRoot) {
    throw new TypeError('Please provide projectData.localPathRoot before invoking getNameAndPath.');
  }

  if (projectData.repoName) {
    repoName = projectData.repoName;
  } else {

    if (!projectData.repoUrl) {
      throw new TypeError('Please pass either projectData.repoUrl or projectData.repoName');
    }

    repoName = /\/([^\/]+?)(?:\.git)?\/?$/.exec(projectData.repoUrl);
    repoName = (repoName && repoName.length ? repoName[1] : false);
    if (!repoName) {
      throw new TypeError('Could not determine repository name.');
    }
  }

  localPath = path.join(projectData.localPathRoot, repoName);

  projectData.repoName = repoName;
  projectData.localPath = localPath;

  return projectData;
}
