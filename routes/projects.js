'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var appConfig = require('../lib/configuration/app-config').get();

var getProjectsNames = require('../lib/specifications/projects/project').getNames;
var getProject = require('../lib/specifications/projects/project').get;

var appVersion = require('../package.json').version;


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
      .catch(function(err) {
        // Pass on to the error handling route.
        next(err);
      });
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
    .catch(function(err) {

      // Pass on to the error handling route.
      next(err);
    });
});


// Post request to trigger an update remotely.
router.post( '/', function(req, res, next) {
  var repoUrl = req.query.repo_url;

  if (!repoUrl) {
    res.status(400);
    res.send('Please provide a "repo_url" query parameter.');
    return;
  }

  var projectData = {
    repoUrl: repoUrl,
    localPathRoot: appConfig.projectsPath
  };

  getProject(projectData)
    .then(function() {
      res.send('Project updated.');
    })
    .catch(function(err) {
      next(err);
    });
});


module.exports = router;
