'use strict';

var fs = require('fs');
var qfs = require('q-io/fs'); // https://github.com/kriskowal/q-io
var path = require('path');

// TODO: don't like hardcoding this.
var appRoot = path.join(__dirname, '..', '..');

// Stick the data in a project-data subdirectory.
var projectDataDirectory = path.join(appRoot, 'project-data');

module.exports = {

  // Return promise for write completion.
  persist: function(projectData) {

    // Ensure project data directory exists and write the file.
    fs.existsSync(projectDataDirectory) || fs.mkdirSync(projectDataDirectory);
    return qfs.write(path.join(projectDataDirectory, projectData.name + '.data'), JSON.stringify(projectData));
  },

  // Return promise for an array of paths in data directory
  // with the .data file extension.
  getNames: function() {
    return qfs.listTree(projectDataDirectory, function guard(path) {
      return /\.(data)$/.test(path);
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
