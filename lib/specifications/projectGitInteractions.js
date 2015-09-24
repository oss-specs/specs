/**
 * Interact with local and remote project repos using Git.
 */

"use strict";

var git = require("nodegit");
var path = require("path");
var _ = require('underscore');
var Q = require('q');
var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io

// Mac OSX certificate issue http://www.nodegit.org/guides/cloning/
var copingWithMacCertBug = {
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
            }
        });
}

// Wrap up the supplied repository metadata in an object.
// TODO: this model and associated helper functions has become large enough to warrant a separate module.
function generateRepoMetaData(projectData, sha, tagsAndBranches, currentBranchName, files) {
    return {
        repoUrl: projectData.repoUrl,
        repoName: projectData.name,
        localPath: projectData.localPath,
        commit: sha,
        shortCommit: sha.substring(0, 7),
        currentBranchName: currentBranchName,
        currentBranchNameShort: currentBranchName,
        tagsAndBranches: tagsAndBranches,
        featureFilePaths: files
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
        .then(function (repo) {
            repository = repo;
            return repository.getCurrentBranch();
        })
        .then(function (branch) {
            return getRefInformation(projectData, branch.shorthand());
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
    var currentBranchName = projectData.currentBranchName;
    var repository;


    return git.Repository.openBare(projectData.localPath)
        .then(function (repo) {
            repository = repo;
            return repository.fetchAll(copingWithMacCertBug, true);
        })
        .then(function () {
            return repository.getCurrentBranch();
        })
        .then(function (branch) {
            return getRefInformation(projectData, 'master');
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

            // Need to define this here as the Clone function modifies the passed object (face palm).
            var cloneOptions = {};
            cloneOptions.bare = 1;
            cloneOptions.remoteCallbacks = copingWithMacCertBug;

            /**
             * If there is no matching directory then clone the repo
             * else perform a pull on it.
             */
            if (!pathExists) {
                return clone(projectData, cloneOptions);
            } else {
                return update(projectData);
            }
        });
};

function getBranch(projectData, name) {
    // TODO fix lol
    return git.Repository.open(projectData.localPath)
        .then(function(repo) {
            if(name) return repo.getBranch(name);

            return repo.getCurrentBranch();
        });
}


function getRefInformation(projectData, targetBranchName) {
    // The targetBranchName is the full remote branch ref.
    // The shortBranchName is what the local branch would be called.
    var branch;
    var shortBranchName;

    var repository;
    var headCommit;
    var listOfFiles;

    return getBranch(projectData, targetBranchName)
        .then(function(b) {
            branch = b;
            shortBranchName = branch.shorthand()
            return git.Repository.open(projectData.localPath)
        })
        .then(function (repo) {
            repository = repo;
            return repository.getReferenceCommit(branch.name());
        })
        .then(function (commit) {
            headCommit = commit.sha();
            return commit.getTree();
        })
        .then(getAllFiles)
        .then(function(files) {
            listOfFiles = files;
            return repository.getReferences();
        })
        .then(function (refNames) {
            var tagsAndBranches = parseTagsAndBranches(refNames, branch);
            return generateRepoMetaData(projectData, headCommit, tagsAndBranches, branch.name(), listOfFiles);
        });
}

function _getAllFiles(tree) {
    var files = [];

    tree.entries().forEach(function (e) {
        if (e.isFile())
            files.push(e.path());

        if (e.isTree())
            files.push(e.getTree().then(function (t) {
                return _getAllFiles(t);
            }));
    });

    return Q.all(files)
        .then(function(files) {
            return _.flatten(files);
        });
}

function getAllFiles(tree) {
    return _getAllFiles(tree)
        .then(function(files) {
            return files.filter(function(f) {
                return /\.(feature|md)/.test(f);
            })
                .map(function(f) {
                    return { featureRoute: f,
                        featureName: f,
                        featureNameShort: f }
                })

        });
}


function getFilePaths(projectData, branch) {
    // The targetBranchName is the full remote branch ref.
    // The shortBranchName is what the local branch would be called.

    if(!branch) {
        branch = projectData.currentBranchName;
    }

    var repository;


    return git.Repository.open(projectData.localPath)
        .then(function (repo) {
            repository = repo;
            return repository.getReferenceCommit(branch);
        })
        .then(function (commit) {
            return commit.getTree();
        })
        .then(function (tree) {
            return getAllFiles(tree);
        });
}


module.exports = {
    getProject: getProject,
    getFilePaths: getFilePaths,
    getRefInformation: getRefInformation
};
