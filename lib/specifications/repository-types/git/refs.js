/**
 * Functionality related to Git refs e.g. branches, tags, commits.
 */
'use strict';

var git = require('nodegit');

module.exports = {
  getBranch: getBranch,
  getCommitByName: getCommitByName
};


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
// if that fails fall back to trying the annotated tag approach.
function getCommitByName(repository, refName) {
  return repository.getReferenceCommit(refName)
    .catch(function() {
      return repository.getTagByName(refName).then(function(tag) {
        return repository.getCommit(tag.targetId().tostrS());
      });
    });
}
