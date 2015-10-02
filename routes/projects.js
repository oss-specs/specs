'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var appConfig = require('../lib/configuration').get();

var getAllProjects = require('../lib/specifications/projectData').getAll;
var getProject = require('../lib/specifications/projectData').get;

var appVersion = require('../package.json').version;

// Projects page.
// http://host/
router.get('/', function(req, res, next) {
  var repoUrl = req.query.repo_url;

  // If there is no URL query param then
  // render the projects page.
  if (!repoUrl) {
    getAllProjects()
      .then(function(projectData) {
        var data = {
          projectRoute: appConfig.projectRoute,
          appVersion: appVersion
        };
        if (projectData.length) {
          data.projects = projectData;
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
  var projectRoute = appConfig.projectRoute;

  var repoName = /\/([^\/]+?)(?:\.git)?\/?$/.exec(repoUrl);
  repoName = (repoName && repoName.length ? repoName[1] : false);
  if (!repoName) {
    throw new TypeError('Could not determine repository name.');
  }

  var projectData = {
    repoName: repoName,
    repoUrl: repoUrl,
    localPath: path.join(appConfig.projectsPath, repoName),
    projectLink: path.posix.join(projectRoute, repoName)
  };

  // Done like this rather than in the project route so that there is no blank
  // page while the repo is cloned.
  getProject(projectData)
    .then(function(projectMetadata) {

      // Redirect to the project page.
      res.redirect(projectMetadata.projectLink);
    })
    .catch(function(err) {

      // Pass on to the error handling route.
      next(err);
    });
});


module.exports = router;
