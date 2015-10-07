'use strict';

var fs = require('q-io/fs');

var getProjectGit = require('./repositoryTypes/git').getProject;
var getProjectDataGit = require('./repositoryTypes/git').getProjectData;
var getFileContentsGit = require('./repositoryTypes/git').getFileContents;
var config = require('../configuration').get();


/**
 * Get the meta data for a single project from a name.
 *
 * @return a promise for the meta data for one project.
 */
function get(projectData) {
  return getProjectGit(projectData);
}

function getData(projectData, targetBranchName) {
  return getProjectDataGit(projectData, targetBranchName);
}

function getFileContents(projectData, filePath) {
  return getFileContentsGit(projectData, filePath);
}

/**
 * Get the meta data for all projects.
 *
 * @return a promise for an array meta data for all the projects.
 */
function getAll() {
  return fs.list(config.projectsPath)
      .then(function(paths) {
        return paths.map(function(path) {
          return fs.base(path);
        });
      })
      .catch(function(error) {
        // If there are no sets of project data on file return an empty list.
        // Else, rethrow because an error wasn't expected.
        if (error.code !== 'ENOENT') {
          throw error;
        }
        return [];
      });
}

module.exports = {
  get: get,
  getData: getData,
  getAll: getAll,
  getFileContents: getFileContents
};
