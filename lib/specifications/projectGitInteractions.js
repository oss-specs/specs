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

var tagOrBranchRegex = /^(refs\/remotes\/origin\/|refs\/tags\/)/;

/**
 * Parse the tag and branch names out of the refs list
 * and generate an object of data to return.
 */
function parseTagsAndBranches(refNames, projectBranchName) {
  return refNames
    .filter(function(refName) {
      return tagOrBranchRegex.test(refName);
    })
    .map(function(refName) {
      var shortName = refName.replace(tagOrBranchRegex, '');
      var safeName = encodeURIComponent(refName);
      return {
        name: shortName,
        urlEncodedName: safeName,
        current: (shortName === projectBranchName)
      }
    });
}

// Wrap up the supplied repository metadata in an object.
function generateRepoMetaData(projectData, sha, tagsAndBranches, currentBranchName) {
  return {
    repoUrl: projectData.url,
    repoName: projectData.name,
    localPath: projectData.localPath,
    commit: sha,
    shortCommit: sha.substring(0, 7),
    currentBranchName: currentBranchName,
    currentBranchNameEncoded: encodeURIComponent(currentBranchName),
    tagsAndBranches: tagsAndBranches
  };
}


/**
 * Clone the project.
 *
 * @return a promise for the repo metadata.
 */
function clone(projectData, cloneOptions) {
  var repository;
  return git.Clone(projectData.url, projectData.localPath, cloneOptions)
    .then(function(repo) {
      repository = repo;
      return repository.getCurrentBranch();
    })
    .then(function(branch) {

      // Switch to the remote version of the branch so all branches are handled consistenly.
      var remoteBranchName = 'refs/remotes/origin/' + branch.shorthand();
      return repository.getReference(remoteBranchName);
    })
    .then(function(remoteBranch) {
      return checkoutRemoteBranch(projectData, remoteBranch.name());
    });
}


/**
 * Perform a pull on the project.
 * https://github.com/nodegit/nodegit/issues/341
 * https://github.com/nodegit/nodegit/commit/dc814a45268305e56c99db64efd5d0fe8bbbb8c2
 *
 * @return a promise for the repo metadata.
 */
function update(projectData) {

  // DEBUG
  console.log("&&&&&&&");
  console.log(projectData);

  var currentBranchName = projectData.currentBranchName;
  var repository;

  if (!currentBranchName) {
      throw new TypeError("No current branch name supplied to update function.");
  }

  return git.Repository.open(projectData.localPath)
    .then(function(repo) {
      repository = repo;
      return repository.fetchAll(copingWithMacCertBug, true);
    })
    .then(function() {
      return checkoutRemoteBranch(projectData, currentBranchName);
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

        console.log('clone');

        return clone(projectData, cloneOptions);
      } else {

        console.log('update');

        return update(projectData);
      }
    });
};


/**
 * Change the checked out ref to the commit at the head of the specified remote branch.
 *
 * @return a promise for the repo metadata.
 */
function checkoutRemoteBranch(projectData, targetBranchName) {
  var Checkout = git.Checkout;

  // The targetBranchName is the full remote branch ref.
  // The shortBranchName is what the local branch would be called.
  var shortBranchName = targetBranchName.replace(tagOrBranchRegex, '');

  var repository;
  var headCommit;

  return git.Repository.open(projectData.localPath)
    .then(function(repo) {
      repository = repo;
      return repository.getReferenceCommit(targetBranchName);
    })
    .then(function(branchCommit) {
      // Change the working tree.
      return Checkout.tree(repository, branchCommit, { checkoutStrategy: Checkout.STRATEGY.FORCE});
    })
    .then(function() {
      // Change the commit information.
      return repository.setHead(targetBranchName, repository.defaultSignature(), "Switch HEAD to " + shortBranchName);
    })
    .then(function() {
      return repository.getHeadCommit();
    })
    .then(function(commit) {
      headCommit = commit.sha();
      return repository.getReferenceNames();
    })
    .then(function(refNames) {
      var tagsAndBranches = parseTagsAndBranches(refNames, shortBranchName);
      return generateRepoMetaData(projectData, headCommit, tagsAndBranches, targetBranchName);
    });
}

module.exports = {
  getProject: getProject,
  changeBranch: checkoutRemoteBranch
};