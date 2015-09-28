"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();
var appConfig = require('../lib/configuration').get();
var path = require('path');

var Q = require('q');

var getProjectMetaDataByName = require('../lib/specifications/projectMetaData').getByName;
var getRefInformation = require('../lib/specifications/projectGitInteractions').getRefInformation;
var updateProject = require('../lib/specifications/getProject').update;

// List of available features in a project.
router.get(/^\/([^\/]+)$/, function(req, res, next) {
  if(!req.session.branches) req.session.branches = {};

  // Session variable.
  var branches = req.session.branches;

  var repoName = req.params[0];

  // TODO: Have one place this object is created.
  var projectData = {
    repoName: repoName,
    projectLink: path.posix.join('/project', repoName),
    localPath: path.join(appConfig.projectsPath, repoName)
  };

  // Query param causing a Git update (pull).
  var projectShouldUpdate = (req.query.update === 'true');

  // Query param indicating that it should be attempted
  // to check out the specified branch.
  var targetBranchName = req.query.branch || false;

  // Render the project page and send to client.
  function render(projectData) {
    var data = {
      renderingOptions: {}
    };

    if (projectData) {
      data['project'] = projectData;
    }

    res.render('project', data);
  }

  function passError(err) {
    next(err)
  }

  // If the update flag is set then branch change requests will be ingored.
  if (projectShouldUpdate) {
    updateProject(projectData)
      .then(render)
      .catch(passError);

  // Change the branch.
  // TODO: this should not know about Git refs.
  } else if (targetBranchName) {
    branches[repoName] = targetBranchName;
    getProjectMetaDataByName(projectData)
      .then(function(projectData) {
          return getRefInformation(projectData, targetBranchName)
      })
      .then(render)
      .catch(passError);

  // Else, generate the metadata and render the page.
  } else {
    getProjectMetaDataByName(projectData, branches[repoName])
      .then(render)
      .catch(passError);
  }
});

module.exports = router;
