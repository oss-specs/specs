/**
 * Generate a link for editing a file in a Git repo.
 */
'use strict';

var handlebars = require('hbs').handlebars;

module.exports = function getEditUrl(projectData, filePath) {

  if (!projectData.config.editUrlFormat) {
    return;
  }

  projectData.editUrlTemplate = projectData.editUrlTemplate ||
      handlebars.compile(projectData.config.editUrlFormat);

  return projectData.editUrlTemplate({
    repoUrl: projectData.repoUrl,
    repoUrlWithoutGitSuffix: projectData.repoUrl.replace(/\.git$/i, ''),
    branchName: projectData.currentShortBranchName,
    pathToFile: filePath
  });
};
