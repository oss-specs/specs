/**
 * Functionality related to cloning and updating Git repositories.
 */
'use strict';

var util = require('util');

var git = require('nodegit');

var appConfig = require('../../../configuration/app-config').get();

var getProjectData = require('./project-data').getProjectData;

module.exports = {
  clone: clone,
  update: update
};


var ignoreSSLErrors = {
  certificateCheck: function () {
    return 1;
  }
};


/**
 * Clone the project.
 *
 * @return a promise for the repo metadata.
 */
function clone(projectData) {
  var repository;

  // Need to define this here as the Clone function modifies the passed object (face palm).
  var cloneOptions = {};
  cloneOptions.bare = 1;

  // Mac OSX certificate issue http://www.nodegit.org/guides/cloning/
  // This is now an undocumented Mac only part of the API.
  cloneOptions.remoteCallbacks = ignoreSSLErrors;

  // General option to ingore SSL errors.
  if(appConfig.allowInsecureSSL) {
    cloneOptions.fetchOpts = {
      callbacks: ignoreSSLErrors
    };
  }

  if (!projectData.repoUrl) {
    throw new TypeError('Clone called without a repo URL. Possible wrong project name?');
  }

  return git.Clone(projectData.repoUrl, projectData.localPath, cloneOptions)
    .then(function (repo) {
      repository = repo;
      return repository.getCurrentBranch();
    })
    .then(function (branch) {
      return getProjectData(projectData, branch.shorthand());
    });
}


/**
 * Perform a fetch on the project.
 *
 * @return a promise for the repo metadata.
 */
function update(projectData) {

  var repository;
  var defaultBranch;
  var defaultRemoteBranch;

  return git.Repository.openBare(projectData.localPath)


    .then(function (repo) {
      repository = repo;

      var fetchOptions = {};
      fetchOptions.downloadTags = 1;
      fetchOptions.prune = 1;
      fetchOptions.bare = 1;
      fetchOptions.updateFetchhead = 1;

      // OSX specific workaround.
      fetchOptions.remoteCallbacks = ignoreSSLErrors;

      if (appConfig.allowInsecureSSL) {
        fetchOptions.callbacks = ignoreSSLErrors;
      }

      // Note: annotated tags are not being pulled down
      // because NodeGit does not handle them.
      // https://github.com/nodegit/nodegit/issues/742
      return repository.fetch('origin', fetchOptions);
    })
    .then(function () {
      return repository.getCurrentBranch();
    })
    .then(function (ref) {
      defaultBranch = ref;
      return repository.getBranch(util.format('origin/%s', ref.shorthand()));
    })
    .then(function (ref) {
      defaultRemoteBranch = ref;
      defaultBranch.setTarget(defaultRemoteBranch.target(), 'Moving default branch target to match remote');
    })
    .then(function () {
      return getProjectData(projectData, projectData.currentBranchName);
    });
}
