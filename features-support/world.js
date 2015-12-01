'use strict';

var fs = require('q-io/fs'); // https://github.com/kriskowal/q-io
var path = require('path');

// This config is purely to get correct directories for deletion, it
// does not affect how the app is configured.
var appConfig = require('../lib/configuration/app-config').set({
  rootPath: path.join(__dirname, '../')
});

module.exports = function() {
  this.World = function World() {
    this.appPort = process.env.PORT || 3000;

    /**
     * Remove any specs and data already in place.
     *
     * @return promise for operation completion.
     */
    this.deleteProjectData = function() {
      return fs.removeTree(appConfig.projectsPath)
        .catch(function(err) {

          // Ignore failure to unlink missing directory.
          if (err.code !== 'ENOENT') {
            throw err;
          }
        });
    };
  };
};
