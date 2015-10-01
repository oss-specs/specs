"use strict";

var path = require('path');
//var url = require('url');

var fs = require('q-io/fs');

var getProject = require('./repositoryTypes/git').getProject;
var config = require('../configuration').get();


/**
 * Get the meta data for a single project from a name.
 *
 * @return a promise for the meta data for one project.
 */
function get(projectData) {
  return getProject(projectData);
}


/**
 * Get the meta data for all projects.
 *
 * @return a promise for an array meta data for all the projects.
 */
function getAll() {
  return fs.list(config.projectsPath)
      .then(function(paths) {
        return paths.map(function(path) {
          return fs.base(path);
        })
      })
      .catch(function(error) {
        // If there are no sets of project data on file return an empty list.
        // Else, rethrow because an error wasn't expected.
        if (error.code !== "ENOENT") {
          throw error;
        }
        return [];
      });
}

module.exports = {
  getAll: getAll,
  get: get
}