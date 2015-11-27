/**
 * Functionality related to generating Git project data.
 */
'use strict';

var git = require('nodegit');

var getNameAndPath = require('./name-and-path').getNameAndPath;

var getAllFiles = require('./files').getAllFiles;

var getCommitByName = require('./refs').getCommitByName;
var getBranch = require('./refs').getBranch;


module.exports = {
  getProjectData: getProjectData
};


function getProjectData(projectData, targetBranchName) {
  var currentRef;
  var repository;
  var remoteUrl;
  var headCommit;
  var listOfFiles;

  // Determine the project name and local path.
  projectData = getNameAndPath(projectData);

  return getBranch(projectData, targetBranchName)
    .then(function (ref) {
      currentRef = ref;
      return git.Repository.openBare(projectData.localPath);
    })
    .then(function (repo) {
      repository = repo;
      return repository.getRemote('origin');
    }).then(function (remote) {
      remoteUrl = remote.url();

      return getCommitByName(repository, currentRef.name());
    })
    .then(function (commit) {
      headCommit = commit.sha();
      return commit.getTree();
    })
    .then(getAllFiles)
    .then(function (files) {
      listOfFiles = files;

      return repository.getReferences(git.Reference.TYPE.OID);
    })
    .then(function (refs) {
      var tagsAndBranches = parseTagsAndBranches(refs, currentRef);
      return generateRepoMetaData(projectData, headCommit, tagsAndBranches, currentRef.name(), listOfFiles, remoteUrl);
    });
}

/**
 * Parse the tag and branch names out of the refs list
 * and generate an object of data to return.
 */
function parseTagsAndBranches(refs, projectRef) {
  return refs
    .map(function (ref) {
      var shortName = ref.shorthand();
      var safeName = encodeURIComponent(ref.name());
      return {
        name: shortName,
        tag: ref.isTag(),
        branch: ref.isBranch(),
        urlEncodedName: safeName,
        current: ref.name() === projectRef.name()
      };
    });
}

// Wrap up the supplied repository metadata in an object.
function generateRepoMetaData(projectData, sha, tagsAndBranches, currentBranchName, files, remoteUrl) {
  var updatedData = {

    // Copied. These are derived in getProject or getProjectData
    // then copied and returned so that they can be used by
    // other methods such as getFileContent.
    localPath: projectData.localPath,
    repoName: projectData.repoName,

    // New
    commit: sha,
    shortCommit: sha.substring(0, 7),
    tagsAndBranches: tagsAndBranches,
    currentBranchName: currentBranchName,
    currentShortBranchName: currentBranchName.replace(/refs\/remotes\/origin\/|refs\/heads\//, ''),
    repoUrl: remoteUrl,
    files: files
  };

  // Filter falsey values and empty arrays.
  function findFalsey(data) {
    return function (key) {
      var value = data[key];
      return !data[key] || (value.length !== undefined ? value.length === 0 : false);
    };
  }

  var missingValues = Object.keys(updatedData).filter(findFalsey(updatedData));
  if (missingValues.length) {
    process.stdout.write('DEBUG: Missing values:' + '\n');
    process.stdout.write(missingValues.toString() + '\n');
  }

  return updatedData;
}
