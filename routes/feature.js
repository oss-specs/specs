"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var markdown = require( "markdown" ).markdown;

var getFeatureFile = require("../lib/specifications/getFeatureFile");
var GherkinParser = require('../lib/parser/gherkin.js');

// Match all routes with something after the slash
// and display an individual feature.
router.get(/^\/(.+)/, function(req, res, next) {
  var featureFilePath = req.params[0];

  // Skip the rendering for query param ?plain=true ?plain=1 etc.
  var renderPlainFile = req.query.plain === 'true' || !!parseInt(req.query.plain);

  getFeatureFile(featureFilePath)
    .then(function(fileContents) {
      var parser;
      var features;
      var isFeatureFile = /.*\.feature/.test(featureFilePath);
      var isMarkdownFile = /.*\.md/.test(featureFilePath);

      if (isFeatureFile && !renderPlainFile) {
        parser = new GherkinParser();
        features = parser
          .parse(fileContents)
          .getFeatures();
        res.render('feature', {features: features});
      } else if (isMarkdownFile && !renderPlainFile) {
        res.render('markdown-file', {markdownHtml: markdown.toHTML(fileContents)});
      } else {
        res.render('general-file', {contents: fileContents});
      }
    })
    .catch(function(err) {
      // Pass on to the error handling route.
      if (if !err.status && err.code === 'ENOENT') {
        err.status = 404;
      }
      next(err);
    });
})

module.exports = router;
