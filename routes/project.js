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

  // Query param indicating a particular ref should
  // be used when retrieving repo data.
  var targetBranchName = req.query.branch || false;

  // Query param causing a Git update (pull).
  var projectShouldUpdate = (req.query.update === 'true');

  // Create the render and passError functions.
  var configuredRender = getRender(res, appConfig);
  var configuredPassError = getPassError(next);

  // TODO: Have one place this object is created.
  var projectData = {
    repoName: repoName,
    projectLink: path.posix.join(appConfig.projectRoute, repoName),
    localPath: path.join(appConfig.projectsPath, repoName)
  };

  // Perform a fetch on the repo then get the data.
  // If this switch is set then the branch will not change.
  if (projectShouldUpdate) {

    projectData.currentBranchName = branches[repoName];

    // Correct, performs an update.
    getProject(projectData)
      .then(configuredRender)
      .catch(configuredPassError);

  // Change the branch.
  } else if (targetBranchName) {

    // BUG Performs two updates. Shouldn't update, should just get data.

    // Update the session variable.
    branches[repoName] = targetBranchName;
    projectData.currentBranchName = branches[repoName];

    console.log(projectData);

    getProject(projectData)
      .then(configuredRender)
      .catch(configuredPassError);

  // Else, generate the metadata and render the page.
  } else {

    projectData.currentBranchName = branches[repoName];

    // BUG: Currently causes an update. Needs the data only.
    getProject(projectData)
      .then(configuredRender)
      .catch(configuredPassError);
  }
});

module.exports = router;
