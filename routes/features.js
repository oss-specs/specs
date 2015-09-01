"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var Q = require('q');

var getFeatureFilePaths = require("../lib/specifications/getFeatureFilePaths");

// Configure the root for data storage.
// TODO: This will also be needed for reading the data, we need in memory key-value peristence of configuration.
var projectDataStorage = require('../lib/specifications/projectDataStorage');

// Default route for 'features' is the list of
// available features in each known project.
router.get('/', function(req, res, next) {

  projectDataStorage.getNames()
    .then(function(names) {

      // TODO: POSSIBLE FEATURE. If there are no names, reparse the repos for project data.

      var promisesForData = names.map(function(name) {
        return projectDataStorage.get(name);
      });

      // Convert to promise for array of values.
      return Q.all(promisesForData);
    })
    .then(function(projectData) {
      res.render('features', {projects: projectData});
    })
    .catch(function(err) {
      // Pass on to the error handling route.
      next(err);
    });
});

module.exports = router;
