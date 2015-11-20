
'use strict';

var fs = require('q-io/fs');

var getProjectGit = require('../repository-types/git').getProject;
var getProjectDataGit = require('../repository-types/git').getProjectData;
var getFileContentsGit = require('../repository-types/git').getFileContents;

var appConfig = require('../../configuration/app-config').get();
var projectConfig = require('../../configuration/project-config');


/**
 * Get a project from some source and return the associated data.
 *
 * @return a promise for the project data.
 */
function get(projectData) {
  return getProjectGit(projectData)
    .then(sanitiseFileList)
    .then(addProjectConfig);
}


/**
 * Assume a project already exists and return the associated data.
 *
 * @return a promise for the project data.
 */
function getData(projectData, targetBranchName) {
  return getProjectDataGit(projectData, targetBranchName)
    .then(sanitiseFileList)
    .then(addProjectConfig);
}


/**
 * Get the file contents for a given project.
 *
 * @return a promise for the contents of the projects files.
 */
function getFileContents(projectData, filePath) {
  return getFileContentsGit(projectData, filePath)
    .then(sanitiseFileList);
}


/**
 * Modify a projects file list to only include desired files.
 *
 * @return a promise for the project data.
 */
function sanitiseFileList(projectData) {
  if(!projectData.files) return projectData;

  projectData.files = projectData.files.filter(appConfig.isFileOfInterest.bind(appConfig));
  return projectData;
}

/**
 * Decorate the project data with optional project config from file.
 *
 * @return a promise for the project data.
 */
function addProjectConfig(projectData) {

  function fulfilled(configString) {
    projectData.config = projectConfig.parseConfig(configString);
    return projectData;
  }

  /* eslint-disable no-unused-vars, no-console */
  return getFileContentsGit(projectData, projectConfig.getConfigFilePath())
    .then(fulfilled, function(error) {
      // Try again with file name prefixed with a '.'.
      return getFileContentsGit(projectData, '.' + projectConfig.getConfigFilePath())
        .then(fulfilled, function(error) {
          console.log('No specs.json or .specs.json file found.');
          projectData.config = false;
          return projectData;
        });
    });
  /* eslint-enable no-unused-vars, no-console */
}



/**
 * Get a list of known project names.
 *
 * @return a promise for an array of project names.
 */
function getNames() {
  return fs.list(appConfig.projectsPath)
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
