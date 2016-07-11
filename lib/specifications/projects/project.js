
'use strict';

var path = require('path');

var fs = require('q-io/fs');

var getProjectGit = require('../repository-types/git').getProject;
var getProjectDataGit = require('../repository-types/git').getProjectData;

var appConfig = require('../../configuration/app-config').get();
var projectConfig = require('../../configuration/project-config');

// Currently hard coded to get file contents from a Git repo.
var getFileContentGit = require('../repository-types/git').getFileContent;
var getFileContent = getFileContentGit;

module.exports = {
  get: get,
  delete: deleteProject,
  getData: getData,
  getNames: getNames,
  getFileContent: getFileContent
};

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

function deleteProject(projectName) {
  var projectPath = path.join(appConfig.projectsPath, projectName);
  return fs.removeTree(projectPath);
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
  function finalReject(error) {
    console.log('No specs.json or .specs.json file found.');
    projectData.config = false;
    return projectData;
  }

  return getFileContent(projectData, projectConfig.getConfigFilePath())
    .then(fulfilled, function(error) {

      // Try again with file name prefixed with a '.'.
      return getFileContent(projectData, '.' + projectConfig.getConfigFilePath())
        .then(fulfilled, finalReject);
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
