'use strict';
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getFeatureFilePaths = require("../lib/specifications/getFeatureFilePaths");

/* GET home page. */
router.get('/', function(req, res) {
  getFeatureFilePaths('public/feature-files')
    .then(function(featureFilePaths) {

      // There's no school like old school.
      // Seriously, I will replace this with a templating engine once it matters.
      var content =
        '<head><link rel="stylesheet" href="public/css/modified-normalize.css"><link rel="stylesheet" href="public/css/alphabeta.css"><link rel="stylesheet" href="public/css/main.css"></head>' +
        '<body>' +
        '<div class="alphabeta"></div>' +
        '<main>' +
        '<header><h1>Available Specifications</h1></header>' +
        '<section>' +
        (featureFilePaths.reduce(function(previous, current) {
          return previous + '<p><a href="' + current.replace('.feature','').replace('public/','') + '">' + current + '</a></p>'
        }, '') || '<p>No specifications found.</p>') +
        '</section>' +
        '</main>' +
        '</body>';

      res
        .status(200)
        .send(content);
    })
    .catch(function(err) {
      res
        .status(500)
        .send(err);
    })
});

module.exports = router;
