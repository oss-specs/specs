"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getFeatureFile = require("../lib/specifications/getFeatureFile");
var GherkinParser = require('../lib/parser/gherkin.js');

// Match all routes with something after the slash
// and display an individual feature.
router.get(/^\/(.+)/, function(req, res) {
  var featureFilePath = req.params[0];

  // Skip the rendering for query param ?plain=true ?plain=1 etc.
  var renderPlainFile = req.query.plain === 'true' || !!parseInt(req.query.plain);

  getFeatureFile(featureFilePath)
    .then(function(fileContents) {
      var parser;
      var features;
      var isFeatureFile = /.*\.feature/.test(featureFilePath);

      if (isFeatureFile && !renderPlainFile) {
        parser = new GherkinParser();
        features = parser
          .parse(fileContents)
          .getFeatures();
        res.render('feature', {features: features});
      } else {
        res.render('general-file', {contents: fileContents});
      }
    })
    .catch(function(err) {
      var errorMessage = err.message || err;
      var stack = err.stack || false;
      res.status(err.code === 'ENOENT' ? 404 : 500)
      res.render('error', {
        message: errorMessage,
        stack: stack
      });
    });
})

module.exports = router;
