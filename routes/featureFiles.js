"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getFeatureFile = require("../lib/specifications/getFeatureFile");

// Match all routes with something after the slash.
router.get(/^\/(.+)/, function(req, res) {
  var featureFilePath = req.params[0];
  getFeatureFile(featureFilePath)
    .then(function(fileContents) {

      // Hack hack hack.
      res.send(fileContents.replace(/\n/g, '<br>'))
    })
    .catch(function(err) {
      res
        .status(err.code === 'ENOENT' ? 404 : 500)
        .send(err);
    });
})

// Default route for /feature-files/ is redirect to app root.
router.get('/', function(req, res) {
  res.redirect('/');
})

module.exports = router;