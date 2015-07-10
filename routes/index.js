'use strict';
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getFeatureFilePaths = require("../lib/specifications/getFeatureFilePaths");

/* GET home page. */
router.get('/', function(req, res) {
  getFeatureFilePaths('public/feature-files')
    .then(function(featureFilePaths) {
      featureFilePaths = featureFilePaths.map(function(featurePath) {
        featurePath = featurePath.replace('public/', '');
        var featureName = featurePath.replace('.feature', '').replace('feature-files/', '');
        return {
          featurePath: featurePath,
          featureName: featureName
        };
      });

      res.render('feature-files', {paths: featureFilePaths});
    })
    .catch(function(err) {
      res
        .status(500)
        .send(err);
    });
});

module.exports = router;
