'use strict';

var fs = require('fs');
var qfs = require('q-io/fs'); // https://github.com/kriskowal/q-io
var path = require('path');

// TODO: don't like hardcoding this.
var appRoot = path.join(__dirname, '..', '..');

// Stick the data in a project-data subdirectory.
var projectDataDirectory = path.join(appRoot, 'project-data');

module.exports = {

  // Return promise for the metadata on write completion.
  persist: function(projectData) {

    // Ensure project data directory exists and write the file.
    fs.existsSync(projectDataDirectory) || fs.mkdirSync(projectDataDirectory);
    return qfs.write(path.join(projectDataDirectory, projectData.name + '.data'), JSON.stringify(projectData))
      .then(function() {
        return projectData;
      });
  },

  // Return promise for an array of paths in data directory
  // with the .data file extension.
  getPaths: function() {
    return qfs.listTree(projectDataDirectory, function guard(path) {
      return /\.data$/.test(path);
    });
  },

  // Return promise for single path to a data file with the specified name.
  getPath: function(name) {
    var regexString = name + '\.data$';
    var regex = new RegExp(regexString);
    return qfs.listTree(projectDataDirectory, function guard(path) {
      return regex.test(path);
    })
    .then(function(paths) {
      if (paths.length) {
        return paths[0];
      }
      return false;
    });
  },

  // Return promise for data.
  get: function(dataFilePath) {
    return qfs.read(dataFilePath)
      .then(function(metaDataJsonString) {
        return JSON.parse(metaDataJsonString);
      });
  }
};
