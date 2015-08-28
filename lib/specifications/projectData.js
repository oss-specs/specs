'use strict';

var fs = require('fs');
var qfs = require('q-io/fs'); // https://github.com/kriskowal/q-io
var path = require('path');

// TODO: don't like hardcoding this.
var projectRoot = path.join(__dirname, '..', '..');

// Stick the data in a project-data subdirectory.
var projectDataDirectory = path.join(projectRoot, 'project-data');

// Ensure project data directory exists.
fs.existsSync(projectDataDirectory) || fs.mkdirSync(projectDataDirectory);

module.exports = {
  // Return promise for write completion.
  persist: function(projectData) {
    return qfs.write(path.join(projectDataDirectory, projectData.name + '.data'), JSON.stringify(projectData));
  },
  // Return promise for data.
  get: function(dataFilePath) {
    return qfs.read(dataFilePath)
      .then(function(metaDataJsonString) {
        return JSON.parse(metaDataJsonString);
      });
  },
  // Return promise for array of paths in data directory.
  getNames: function() {
    return qfs.listTree(projectDataDirectory, function guard(path) {
      return /\.(data)$/.test(path);
    });
  }
};
