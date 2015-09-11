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


/**
 * Parse the tag and branch names out of the refs list
 */
function parseTagsAndBranches(refNames, branchName) {
  var tagOrBranchRegex = /^(refs\/remotes\/origin\/|refs\/tags\/)/;
  return refNames
    .filter(function(refName) {
      return tagOrBranchRegex.test(refName);
    })
    .map(function(refName) {
      var shortName = refName.replace(tagOrBranchRegex, '');
      var safeName = encodeURIComponent(shortName);
      return {
        name: shortName,
        urlEncodedName: safeName,
        current: (shortName === branchName)
      }
    });
}

// Wrap up the supplied repository metadata in an object.
function generateRepoMetaData(projectData, sha, tagsAndBranches) {
  return {
    repoUrl: projectData.url,
    repoName: projectData.name,
    localPath: projectData.localPath,
    commit: sha,
    tagsAndBranches: tagsAndBranches,
    shortCommit: sha.substring(0, 7)
  };
}


/**
 * Clone the project.
 *
 * @return a promise for the repo metadata.
 */
function clone(projectData, cloneOptions) {
  var repository;
  var headCommit;
  var branchName;
  return git.Clone(projectData.url, projectData.localPath, cloneOptions)
    .then(function(repo) {
      repository = repo;
      return repo.getHeadCommit();
    })
    .then(function(commit) {
      headCommit = commit.sha();
      return repository.getCurrentBranch();
    })
    .then(function(branch) {
      branchName = branch.shorthand();
      return repository.getReferenceNames();
    })
    .then(function(refNames) {
      var tagsAndBranches = parseTagsAndBranches(refNames, branchName);
      return generateRepoMetaData(projectData, headCommit, tagsAndBranches);
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
  var headCommit;
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
      // Should be a fast-forward merge.
      // Will return the commit hash of merge, hopefully matching remote HEAD.
      return repository.mergeBranches(branchName, "origin/" + branchName);
    })
    .then(function(commitHash) {
      headCommit = commitHash;
      return repository.getReferenceNames();
    })
    .then(function(refNames) {
      var tagsAndBranches = parseTagsAndBranches(refNames, branchName);
      return generateRepoMetaData(projectData, headCommit, tagsAndBranches);
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
