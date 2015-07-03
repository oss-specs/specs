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
        .type("text/feature")
        .send(featureFilePaths.join("\n"));
    })
    .catch(function(err) {
      res
        .status(500)
        .send(err);
    })
});

module.exports = router;
