/**
 * Generate a link for editing a file in a Git repo.
 */
'use strict';

var handlebars = require('hbs').handlebars;

module.exports = function getEditUrl(projectData, filePath) {
  var editUrlTemplate;

  if (!projectData.config.editUrlFormat) {
    return;
  }

  editUrlTemplate = handlebars.compile(projectData.config.editUrlFormat);
  return editUrlTemplate({
    repoUrl: projectData.repoUrl,
    repoUrlWithoutGitSuffix: projectData.repoUrl.replace(/\.git$/i, ''),
    branchName: projectData.currentShortBranchName,
    pathToFile: filePath
  });
};
