"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var Q = require('q');
var getProjectMetaData = require('../lib/specifications/projectMetaData').get;

// List of available features in each known project.
router.get('/', function(req, res, next) {

  getProjectMetaData()
    .then(function(projectData) {
      var data = {};
      if (projectData.length) {
        data = {projects: projectData}
      }
      res.render('features', data);
    })
    .catch(function(err) {
      // Pass on to the error handling route.
      next(err);
    });
});

module.exports = router;
