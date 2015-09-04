'use strict';
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getProject = require('../lib/specifications/getProject');
var getProjectMetaData = require('../lib/specifications/projectMetaData').get;

router.get('/', function(req, res, next) {
  var repoUrl = req.query.repo_url;
  var projects;

  // If there is no URL query param then
  // render the index page.
  if (!repoUrl) {
    getProjectMetaData()
      .then(function(projectData) {
        var data = {};
        if (projectData.length) {
          data = {projects: projectData}
        }
        res.render('get-features', data);
      })
      .catch(function(err) {
        // Pass on to the error handling route.
        next(err);
      });
    return;
  }

  // Else get the project and load the features page.
  getProject.get(repoUrl)
    .then(function() {

      // Redirect to the features page.
      res.redirect('/features');
    })
    .catch(function(err) {
      // Pass on to the error handling route.
      next(err);
    });
});

module.exports = router;
