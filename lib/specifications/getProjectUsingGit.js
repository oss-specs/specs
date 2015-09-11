/**
 * Interact with local and remote project repos using Git.
 */

"use strict";

var git = require("nodegit");
var path = require("path");
var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io

// Mac OSX certificate issue http://www.nodegit.org/guides/cloning/
var copingWithMacCertBug = {
  certificateCheck: function() { return 1; }
};

// Wrap up the supplied metadata in an object.
function generateRepoMetaData(projectData, sha, branches) {
  return {
    repoUrl: projectData.url,
    repoName: projectData.name,
    localPath: projectData.localPath,
    commit: sha,
    branches: branches,
    shortCommit: sha.substring(0, 7)
  };
}


/**
 * Clone the project.
 *
 * @return a promise for the repo metadata.
 */
function clone(projectData, cloneOptions) {
  return git.Clone(projectData.url, projectData.localPath, cloneOptions)
    .then(function(repo) {
      return repo.getHeadCommit();
    })
    .then(function(commit) {
      return generateRepoMetaData(projectData, commit.sha());
    });
}


/**
 * Perform a pull on the project.
 * https://github.com/nodegit/nodegit/issues/341
 * https://github.com/nodegit/nodegit/commit/dc814a45268305e56c99db64efd5d0fe8bbbb8c2
 *
 * @return a promise for the repo metadata.
 */
function pull(projectData) {
  var repository;
  var branchName;
  return git.Repository.open(projectData.localPath)
    .then(function(repo) {
      repository = repo;
      return repository.getCurrentBranch();
    })
    .then(function(branch) {
      branchName = branch.shorthand();
      return repository.fetchAll(copingWithMacCertBug, true);
    })
    .then(function() {
      return repository
        // Should be a fast-forward merge.
        // Will return the commit hash of merge, hopefully matching remote HEAD.
        .mergeBranches(branchName, "origin/" + branchName)
        .then(function(commitHash) {
          return generateRepoMetaData(projectData, commitHash);
        });
    });
}

/**
 * Get or update the project repo using Git.
 *
 * @return a promise for the repo metadata.
 */
function getProject(projectData) {
  return fs.exists(projectData.localPath)
    .then(function(pathExists) {

      // Need to define this here as the Clone function modifies the passed object (face palm).
      var cloneOptions = {};
      cloneOptions.remoteCallbacks = copingWithMacCertBug;

      /**
       * If there is no matching directory then clone the repo
       * else perform a pull on it.
       */
      if (!pathExists) {
        return clone(projectData, cloneOptions);
      } else {
        return pull(projectData);
      }
    });
};

module.exports = getProject;
