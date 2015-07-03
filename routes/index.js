"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getFeatureFilePaths = require("../lib/specifications/getFeatureFilePaths");

/* GET home page. */
router.get('/', function(req, res) {
  getFeatureFilePaths('public/feature-files')
    .then(function(featureFilePaths) {
      res
        .status(200)
        .send(featureFilePaths.reduce(function(previous, current) {
          // There's no school like old school.
          // Seriously, I will replace this with a templating engine once it matters.
          return previous + '<p><a href="' + current.replace('.feature','').replace('public/','') + '">' + current + '</a></p>'
        }, ''));
    })
    .catch(function(err) {
      res
        .status(500)
        .send(err);
    })
});

module.exports = router;
