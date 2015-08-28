"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var Q = require('q');

var getFeatureFilePaths = require("../lib/specifications/getFeatureFilePaths");

// Configure the root for data storage.
// TODO: This will also be needed for reading the data, we need in memory key-value peristence of configuration.
var projectData = require('../lib/specifications/projectData');

// Default route for 'features' is the list of
// available features in each known project.
router.get('/', function(req, res, next) {

  projectData.getNames()
    .then(function(names) {
      var promisesForData = names.map(function(name) {
        return projectData.get(name);
      });

      // Convert to promise for array of values.
      return Q.all(promisesForData);
    })
    .then(function(projectData) {
      res.render('features', {paths: projectData[0].featureFilePaths});
    })
    .catch(function(err) {
      // Pass on to the error handling route.
      next(err);
    });
});

module.exports = router;
