"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

// HACK FOR DEMO
var fs = require('fs');

var getFeatureFilePaths = require("../lib/specifications/getFeatureFilePaths");
var getFeatureFile = require("../lib/specifications/getFeatureFile");


// TODO post a new repo from which to extract features.

// Default route for 'features' is the list of available features.
router.get('/', function(req, res) {
  getFeatureFilePaths('public/feature-files')
    .then(function(featureFilePaths) {
      featureFilePaths = featureFilePaths
        .filter(function(featurePath) {
          // HACK FOR DEMO
          var content = fs.readFileSync(featurePath, {encoding: 'utf8'});

          return content.length !== 0;
        })
        .map(function(featurePath) {

          // Map from the storage directory to the Express route.
          // TODO move inside getFeatureFilePaths and call it getFeatureFileRoutes.
          featurePath = featurePath.replace('public/feature-files/', 'features/');

          // Create a display name for the feature.
          // TODO move inside getFeatureFilePaths and call it getFeatureFileRoutes.
          var featureName = featurePath.replace('.feature', '').replace('features/', '');

          return {
            featurePath: featurePath,
            // HACK FOR DEMO
            featureName: featureName.replace('autotest/src/test/resources/com/ba/test/','')
          };
        });

      res.render('features', {paths: featureFilePaths});
    })
    .catch(function(err) {
      res
        .status(500)
        .send(err.message || err);
    });
});

// Match all routes with something after the slash
// and display an individual feature.
router.get(/^\/(.+)/, function(req, res) {
  var featureFilePath = req.params[0];

  getFeatureFile(featureFilePath)
    .then(function(fileContents) {

      // Parse the feature from the file contents.
      // TODO move to a separate module.
      var featureLines = fileContents.split('\n');
      res.render('feature', {featureLines: featureLines});
    })
    .catch(function(err) {
      res
        .status(err.code === 'ENOENT' ? 404 : 500)
        .send(err.message || err);
    });
})

module.exports = router;
