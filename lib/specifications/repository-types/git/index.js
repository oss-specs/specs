/**
 * Interact with local and remote project repos using Git.
 */

'use strict';

var getProject = require('./project').getProject;

var getProjectData = require('./project-data').getProjectData;

var getFileContent = require('./files').getFileContent;


module.exports = {
  getProject: getProject,
  getProjectData: getProjectData,
  getFileContent: getFileContent
};
