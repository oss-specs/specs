'use strict';
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var getProject = require('../lib/specifications/getProject');

router.get('/', function(req, res, next) {
  var repoUrl = req.query.repo_url;

  // If there is no URL query param then
  // render the index page.
  if (!repoUrl) {
    res.render('get-features');
    return;
  }

  // Else get the project and load the features page.
  getProject(repoUrl)
    .then(function() {

      // Redirect to the features page.
      res.redirect('/features');
    })
    .catch(function(err) {
      // Pass on to the error handling route.
      next(err);
    });
});

module.exports = router;
