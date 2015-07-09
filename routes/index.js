'use strict';
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getProject = require("../lib/specifications/getProject");

router.get('/', function(req, res) {
  var repoUrl = req.query.repo_url;

  // If there is no URL query param then
  // immediately render the page.
  if (!repoUrl) {
    res.render('index');
    return;
  }

  getProject(repoUrl)
    .then(function(data) {

      // Redirect to the features page.
      res.redirect('/features');
    })
    .catch(function(err) {
      res
        .status(500)
        .send(err);
    });
});

module.exports = router;
