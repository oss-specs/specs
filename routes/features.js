"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var Q = require('q');
var getProjectMetaData = require('../lib/specifications/projectMetaData').getAll;
var updateProject = require('../lib/specifications/getProject').update;

// List of available features in each known project.
router.get('/', function(req, res, next) {
  var projectToUpdate = req.query.update;

  function render(projectData) {
    var data = {};
    if (projectData.length) {
      data = {projects: projectData}
    }
    res.render('features', data);
  }

  function passError(err) {
    next(err)
  }

  if (projectToUpdate) {
    updateProject(projectToUpdate)
      .then(getProjectMetaData)
      .then(render)
      .catch(passError);
  } else {
    getProjectMetaData()
      .then(render)
      .catch(passError);
  }
});

module.exports = router;
