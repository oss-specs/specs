"use strict";
/* eslint new-cap: 0 */

var express = require('express');
var router = express.Router();

var Q = require('q');
var getProjectMetaDataByName = require('../lib/specifications/projectMetaData').getByName;
var updateProject = require('../lib/specifications/getProject').update;

// List of available features in a project.
router.get('/:projectName', function(req, res, next) {

  var projectName = req.params.projectName;

  var projectShouldUpdate = (req.query.update === 'true' || !!parseInt(req.query.update));

  function render(projectData) {
    var data = {};
    if (projectData) {
      data = {project: projectData}
    }
    res.render('project', data);
  }

  function passError(err) {
    next(err)
  }

  if (projectShouldUpdate) {
    updateProject(projectName)
      .then(function() {
        return getProjectMetaDataByName(projectName);
      })
      .then(render)
      .catch(passError);
  } else {
    getProjectMetaDataByName(projectName)
      .then(render)
      .catch(passError);
  }
});

module.exports = router;
