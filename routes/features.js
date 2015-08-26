"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getFeatureFilePaths = require("../lib/specifications/getFeatureFilePaths");

// Default route for 'features' is the list of available features.
router.get('/', function(req, res) {
  getFeatureFilePaths('public/feature-files')
    .then(function(featureFilePaths) {
      featureFilePaths = featureFilePaths.map(function(featurePath) {

        // Map from the storage directory to the Express route.
        // TODO move inside getFeatureFilePaths and call it getFeatureFileRoutes.
        featurePath = featurePath.replace('public/feature-files/', 'features/');

        // Create a display name for the feature.
        // TODO move inside getFeatureFilePaths and call it getFeatureFileRoutes.
        var featureName = featurePath.replace('.feature', '').replace('features/', '');

        return {
          featurePath: featurePath,
          featureName: featureName
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

module.exports = router;
