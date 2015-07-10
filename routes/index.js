'use strict';
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getProject = require("../lib/specifications/getProject");

router.get('/', function(req, res) {
  var repoUrl = req.query.repo_url;

  // If there is no URL query param then
  // render the index page.
  if (!repoUrl) {
    res.render('index');
    return;
  }

  getProject(repoUrl)
    .then(function(headCommitHash) {

      // Redirect to the features page.
      // TODO features page per repo, then using the commit hash makes sense.
      res.redirect('/features');
    })
    .catch(function(err) {
      res
        .status(500)
        .send(err.message || err);
    });
});

module.exports = router;
