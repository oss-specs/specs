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


  var branches = req.session.branches;

  var projectName = req.params[0];


  var projectData = {
    repoName: projectName,
    name: projectName,
    projectLink: path.join('/project', projectName),
    localPath: path.join(appConfig.projectsPath, projectName)
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
    updateProject(projectName)
      .then(function() {
        return getProjectMetaDataByName(projectData);
      })
      .then(render)
      .catch(passError);

  // Change the branch.
  } else if (targetBranchName) {
    branches[projectName] = targetBranchName;
    getProjectMetaDataByName(projectData)
      .then(function(projectData) {
          return getRefInformation(projectData, targetBranchName)
      })
      .then(render)
      .catch(passError);

  // Else, generate the metadata and render the page.
  } else {
    getProjectMetaDataByName(projectData, branches[projectName])
      .then(function(projectData) {
        return getRefInformation(projectData, branches[projectName])
      })
      .then(render)
      .catch(passError);
  }
});

module.exports = router;
