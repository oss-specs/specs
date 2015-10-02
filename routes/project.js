'use strict';

var express = require('express');
var router = express.Router();
var appConfig = require('../lib/configuration').get();
var path = require('path');

var getProject = require('../lib/specifications/projectData').get;

// Render the project page and send to client.
function getRender(res, appConfig) {
  return function render(projectData) {
    var data = {
      renderingOptions: {}
    };

    if (projectData) {
      data['project'] = projectData;
    }

    // Construct the routes for each file of interest.
    data.project.featureFilePaths.forEach(function(featureFile) {
      featureFile.featureRoute = path.posix.join(appConfig.projectRoute, projectData.repoName, featureFile.featureName);
    });

    res.render('project', data);
  };
}

// Pass errors to the next Express middleware for handling.
function getPassError(next) {
  return function passError(err) {
    next(err);
  };
}

// List of available features in a project.
router.get(/^\/([^\/]+)$/, function(req, res, next) {
  if(!req.session.branches) req.session.branches = {};

  // Session variable.
  var branches = req.session.branches;

  // The repository name from the URL.
  var repoName = req.params[0];

  // Query param indicating that it should be attempted
  // to check out the specified branch.
  var targetBranchName = req.query.branch || false;
  if(targetBranchName) {
    branches[repoName] = targetBranchName;
  }

  // Query param causing a Git update (pull).
  var projectShouldUpdate = (req.query.update === 'true');

  // Create the render and passError functions.
  var configuredRender = getRender(res, appConfig);
  var configuredPassError = getPassError(next);

  // TODO: Have one place this object is created.
  var projectData = {
    repoName: repoName,
    projectLink: path.posix.join(appConfig.projectRoute, repoName),
    localPath: path.join(appConfig.projectsPath, repoName),
    currentBranchName: branches[repoName]
  };

  // If the update flag is set then branch change requests will be ingored.
  if (projectShouldUpdate) {
    getProject(projectData)
      .then(configuredRender)
      .catch(configuredPassError);

  // Change the branch.
  // TODO: this should not know about Git refs.
  } else if (targetBranchName) {
    branches[repoName] = targetBranchName;
    getProject(projectData)
      .then(function(projectData) {
        return getProject(projectData, targetBranchName);
      })
      .then(configuredRender)
      .catch(configuredPassError);

  // Else, generate the metadata and render the page.
  } else {
    getProject(projectData, branches[repoName])
      .then(configuredRender)
      .catch(configuredPassError);
  }
});

module.exports = router;
