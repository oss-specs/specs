'use strict';
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getProjectMetaData = require('../lib/specifications/projectMetaData').getAll;
var getProject = require('../lib/specifications/getProject');

var appVersion = require('../package.json').version;

// Projects page.
// http://host/
router.get('/', function(req, res, next) {
  var repoUrl = req.query.repo_url;
  var projects;

  // If there is no URL query param then
  // render the projects page.
  if (!repoUrl) {
    getProjectMetaData()
      .then(function(projectData) {
        var data = {
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
  getProject.get(repoUrl)
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
