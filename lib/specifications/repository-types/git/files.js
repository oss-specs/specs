/**
 * Functionality related to extracting file paths and content from a Git repository.
 */
'use strict';

var git = require('nodegit');
var _ = require('underscore');

var getCommitByName = require('./refs').getCommitByName;

module.exports = {
  getAllFiles: getAllFiles,
  getFileContent: getFileContent
};

function getFileContent(projectData, filePath) {
  var repository;

  if (!projectData.localPath) {
    throw new TypeError('Please construct projectData.localPath before invoking getFileContent');
  }

  if (!filePath) {
    throw new TypeError('Please supply a file path to read file contents.');
  }

  return git.Repository.openBare(projectData.localPath)
    .then(function (repo) {
      repository = repo;
      return getCommitByName(repository, projectData.currentBranchName);
    })
    .then(function (commit) {
      return commit.getTree();
    })
    .then(function (tree) {
      return tree.getEntry(filePath);
    })
    .then(function (entry) {
      return entry.getBlob();
    })
    .then(function (blob) {
      return blob.toString();
    });
}

function getAllFiles(tree) {
  var files = [];

  tree.entries().forEach(function (e) {
    if (e.isFile()) {
      files.push(e.path());
    }

    if (e.isTree()) {
      files.push(e.getTree().then(function (_tree) {
        return getAllFiles(_tree);
      }));
    }
  });

  return Promise.all(files)
    .then(function (files) {
      return _.flatten(files);
    });
}
