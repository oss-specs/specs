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
  return getProjectGit(projectData).then(sanitiseFileList);
}

function getData(projectData, targetBranchName) {
  return getProjectDataGit(projectData, targetBranchName).then(sanitiseFileList);
}

function getFileContents(projectData, filePath) {
  return getFileContentsGit(projectData, filePath).then(sanitiseFileList);
}

function sanitiseFileList(data) {
  if(!data.files) return data;

  data.files = data.files.filter(config.isSupportedFile.bind(config));
  return data;
}

/**
 * Get a list of known project names.
 *
 * @return a promise for an array of project names.
 */
function getNames() {
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
  getNames: getNames,
  getFileContents: getFileContents
};
