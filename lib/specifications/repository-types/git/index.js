/**
 * Interact with local and remote project repos using Git.
 */

'use strict';

var getProject = require('./git-project').getProject;

var getProjectData = require('./git-project-data').getProjectData;

var getFileContent = require('./git-files').getFileContent;


module.exports = {
  getProject: getProject,
  getProjectData: getProjectData,
  getFileContent: getFileContent
};
