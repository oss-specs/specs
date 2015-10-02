'use strict';

var fs = require('q-io/fs'); // https://github.com/kriskowal/q-io
var path = require('path');

var appConfig = require('../lib/configuration').set({
  rootPath: process.env.SPECS_OUT_DIR || __dirname,
  allowInsecureSSL: process.env.SPECS_ALLOW_INSECURE_SSL || false
});

// Get the project metadata module so we can inject test data.
var project = require('../lib/specifications/project');

module.exports = function() {
  this.World = function World(callback) {
    this.appPort = process.env.PORT || 3000;

    /**
     * Remove any specs and data already in place.
     *
     * @return promise for operation completion.
     */
    this.deleteProjectData = function() {
      return fs.removeTree(appConfig.projectsPath)
        .then(function() {
          return fs.removeTree(appConfig.derivedDataPath);
        })
        .catch(function(err) {
          // Ignore failure to unlink missing directory.
          if (err.code !== 'ENOENT') {
            throw err;
          }
        });
    };

    // Done defining World.
    callback();
  };
};
