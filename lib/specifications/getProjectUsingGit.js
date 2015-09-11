/**
 * Interact with local and remote project repos using Git.
 *
 * TODO: Separate out the Clone and Pull logic so Pull can be called independently.
 * TODO: Changing branch.
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
function generateRepoMetaData(repoUrl, repoName, localName, sha, branches) {
  return {
    repoUrl: repoUrl,
    repoName: repoName,
    localName: localName,
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
function clone(repoUrl, repoName, localName, cloneOptions) {
  return git.Clone(repoUrl, localName, cloneOptions)
    .then(function(repo) {
      return repo.getHeadCommit();
    })
    .then(function(commit) {
      return generateRepoMetaData(repoUrl, repoName, localName, commit.sha());
    });
}


/**
 * Perform a pull on the project.
 * https://github.com/nodegit/nodegit/issues/341
 * https://github.com/nodegit/nodegit/commit/dc814a45268305e56c99db64efd5d0fe8bbbb8c2
 *
 * @return a promise for the repo metadata.
 */
function pull(repoUrl, repoName, localName) {
  var repository;
  var branchName;
  return git.Repository.open(localName)
    .then(function(repo) {
      repository = repo;
      return repository.getCurrentBranch();
    })
    .then(function(branch) {
      branchName = branch.shorthand();
      return repository.fetchAll(copingWithMacCertBug, true);
    })
    .then(function() {
      // Should be a fast-forward merge.
      // Will return the commit hash of merge, hopefully matching remote HEAD.
      return repository
        .mergeBranches(branchName, "origin/" + branchName)
        .then(function(commitHash) {
          return generateRepoMetaData(repoUrl, repoName, localName, commitHash);
        });
    });
}

/**
 * Get a copy of the project using Git.
 *
 * @return a promise for the repo metadata.
 */
function getProject(repoUrl, repoName, localName) {
  return fs.exists(localName)
    .then(function(pathExists) {

      // Need to define this here as the Clone function modifies the passed object (face palm).
      var cloneOptions = {};
      cloneOptions.remoteCallbacks = copingWithMacCertBug;

      /**
       * If there is no matching directory then **CLONE** the repo
       * else perform a pull on it.
       */
      if (!pathExists) {
        return clone(repoUrl, repoName, localName, cloneOptions);
      } else {
        return pull(repoUrl, repoName, localName);
      }
    });
};

module.exports = getProject;
