'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var appConfig = require('../lib/configuration/app-config').get();

var getProjectsNames = require('../lib/specifications/projects/project').getNames;
var getProject = require('../lib/specifications/projects/project').get;
var deleteProject = require('../lib/specifications/projects/project').delete;

var appVersion = require('../package.json').version;


function getResponse(res, message) {
  return function() {
    res.send(message);
  };
}

function getErrorHandler(next) {
  return function(err) {
    next(err);
  };
}

function checkArgs(req, res, argName) {
  if (!req.query[argName]) {
    res.status(400);
    res.send('Please provide a "' + argName + '" query parameter.');
    return false;
  }
  return true;
}

// Projects page.
// http://host/
router.get('/', function(req, res, next) {
  var repoUrl = req.query.repo_url;

  // If there is no URL query param then
  // render the projects page.
  if (!repoUrl) {
    getProjectsNames()
      .then(function(projectNames) {
        var data = {
          projectRoute: appConfig.projectRoute,
          appVersion: appVersion
        };
        if (projectNames.length) {
          data.projects = projectNames;
        }
        res.render('projects', data);
      })
      .catch(getErrorHandler(next));
    return;
  }

  // Else get the project and load the individual project page.
  var projectData = {
    repoUrl: repoUrl,
    localPathRoot: appConfig.projectsPath
  };

  // Done like this rather than in the project route
  // so that there is no blank page while the repo
  // is cloned.
  // If the project repo does not exist it will be cloned
  // if it does exist it will be updated.
  getProject(projectData)
    .then(function(projectData) {
      var projectLink = path.posix.join(appConfig.projectRoute, projectData.repoName);

      // Redirect to the project page.
      res.redirect(projectLink);
    })
    .catch(getErrorHandler(next));
});

// Post request to trigger an update remotely.
router.post('/', function(req, res, next) {
  if (!checkArgs(req, res, 'repo_url')) {
    return;
  }

  var projectData = {
    repoUrl: req.query.repo_url,
    localPathRoot: appConfig.projectsPath
  };

  getProject(projectData)
    .then(getResponse(res, 'Project updated.'))
    .catch(getErrorHandler(next));
});

router.delete('/', function(req, res, next) {
  if (!checkArgs(req, res, 'project_name')) {
    return;
  }

  var projectName = req.query.project_name;

  deleteProject(projectName)
    .then(getResponse(res, 'Project deleted.'))
    .catch(getErrorHandler(next));
});


module.exports = router;
