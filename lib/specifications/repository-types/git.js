/**
 * Interact with local and remote project repos using Git.
 */

'use strict';

var git = require('nodegit');
var _ = require('underscore');
var fs = require('q-io/fs'); // https://github.com/kriskowal/q-io
var util = require('util');

var appConfig = require('../../configuration').get();


var ignoreSSLErrors = {
  certificateCheck: function () {
    return 1;
  }
};

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
// TODO: this model should not be generated here.
function generateRepoMetaData(projectData, sha, tagsAndBranches, currentBranchName, files, remoteUrl) {
  var updatedData = {
    // Copied
    repoName: projectData.repoName,
    localPath: projectData.localPath,
    projectLink: projectData.projectLink,
    // New
    commit: sha,
    shortCommit: sha.substring(0, 7),
    tagsAndBranches: tagsAndBranches,
    currentBranchName: currentBranchName,
    currentShortBranchName: currentBranchName.replace('refs/remotes/origin/', ''),
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

      // OSX specific hack.
      fetchOptions.remoteCallbacks = ignoreSSLErrors;

      if (appConfig.allowInsecureSSL) {
        fetchOptions.callbacks = ignoreSSLErrors;
      }

      // BUG: annotated tags are not being pulled down
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

/**
 * Get or update the project repo using Git.
 *
 * @return a promise for the repo metadata.
 */
function getProject(projectData) {
  return fs.exists(projectData.localPath)
    .then(function (pathExists) {


      /**
       * If there is no matching directory then clone the repo
       * else perform a pull on it.
       */
      if (!pathExists) {
        return clone(projectData);
      } else {
        return update(projectData);
      }
    });
}

function getBranch(projectData, branchName) {
  return git.Repository.openBare(projectData.localPath)
    .then(function (repo) {
      if (branchName) {
        return repo.getBranch(branchName);
      }
      return repo.getCurrentBranch();
    });
}

// NodeGit has no sensible way to detect an annotated tag, which is
// handled differently from a lightweight tag. So try the first
// approach which will work for branches and lightweights tags
// if that fails fall bacl to try the annotated tag approach.
function getCommitByName(repository, refName) {
  return repository.getReferenceCommit(refName)
    .catch(function() {
      return repository.getTagByName(refName).then(function(tag) {
        return repository.getCommit(tag.targetId().tostrS());
      });
    });
}

function getProjectData(projectData, targetBranchName) {
  var currentRef;
  var repository;
  var remoteUrl;
  var headCommit;
  var listOfFiles;

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

function getFileContents(projectData, filePath) {
  var repository;

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

function _getAllFiles(tree) {
  var files = [];

  tree.entries().forEach(function (e) {
    if (e.isFile()) {
      files.push(e.path());
    }

    if (e.isTree()) {
      files.push(e.getTree().then(function (t) {
        return _getAllFiles(t);
      }));
    }
  });

  return Promise.all(files)
    .then(function (files) {
      return _.flatten(files);
    });
}

function getAllFiles(tree) {
  return _getAllFiles(tree);
}

module.exports = {
  getProject: getProject,
  getProjectData: getProjectData,
  getFileContents: getFileContents
};
