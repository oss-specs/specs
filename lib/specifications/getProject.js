"use strict";

var path = require('path');

var getProjectUsingGit = require('./projectGitInteractions').getProject;
var changeProjectGitBranch = require('./projectGitInteractions').changeBranch;
var projectMetaData = require('./projectMetaData');

// TODO: move to dependency injection.
var appConfig = require('../configuration').get();


/**
 * Get a copy of the project, derive metadata, store metadata.
 *
 * @return a promise for the project metadata.
 */
function getProject(repoUrl, projectRoute) {
    var repoName = /\/([^\/]+?)(?:\.git)?\/?$/.exec(repoUrl);
    repoName = (repoName && repoName.length ? repoName[1] : false);
    if (!repoName) {
        throw new TypeError("Could not determine repository name.");
    }
    if (!projectRoute) {
      throw new TypeError("Please supply the route for the project pages.");
    }

    var projectData = {
        repoName: repoName,
        repoUrl: repoUrl,
        localPath: path.join(appConfig.projectsPath, repoName),
        projectLink: path.posix.join(projectRoute, repoName)
    }

    // Clone or update the repo then derive and store the project metadata.
    return getProjectUsingGit(projectData);
};


/**
 * Update a project.
 *
 * @return a promise for the completion of repo metadata.
 */
function updateProject(projectName) {
    return projectMetaData.getByName(projectName)
        .then(function (metadata) {
            if (!metadata) {
                throw new Error("No metadata available for this project name: " + projectName);
            }

            // Copy data rather than pass object to avoid object mutation.
            var projectData = {
                name: metadata.name,
                url: metadata.repoUrl,
                localPath: metadata.localPath,
                currentBranchName: metadata.currentBranchName
            }

            // Update the repo then derive and store the project metadata.
            return getProjectUsingGit(projectData)
                .then(projectMetaData.deriveAndStore(appConfig.projectsPath));
        });
}

/**
 * Change project branch.
 *
 * @return a promise for the completion of repo metadata.
 */
function changeBranch(projectName, targetBranchName) {
    return projectMetaData.getByName(projectName)
        .then(function (metadata) {
            if (!metadata) {
                throw new Error("No metadata available for this project name: " + projectName);
            }

            // Copy data rather than pass object to avoid object mutation.
            var projectData = {
                name: metadata.name,
                url: metadata.repoUrl,
                localPath: metadata.localPath
            }

            // Update the repo then derive and store the project metadata.
            return changeProjectGitBranch(projectData, targetBranchName)
                .then(projectMetaData.deriveAndStore(appConfig.projectsPath));
        });
}

module.exports = {
    get: getProject,
    update: updateProject,
    changeBranch: changeBranch
};
