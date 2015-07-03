"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getFeatureFiles = require("../lib/specifications/getFeatureFiles");

/* GET home page. */
router.get('/', function(req, res) {
  getFeatureFiles('public/feature-files')
    .then(function(featureFiles) {
      res
        .status(200)
        .type("text/feature")
        .send(featureFiles.join("\n"));
    })
    .catch(function(err) {
      res
        .status(500)
        .send(err);
    })
});

module.exports = router;
