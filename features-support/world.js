'use strict';

// This breaks webdriver selenium-webdriver/io/index.js line 237
// var fs = require('q-io/fs'); // https://github.com/kriskowal/q-io
var fs = require('fs-extra');
var path = require('path');

// This config is purely to get correct directories for deletion, it
// does not affect how the app is configured.
var appConfig = require('../lib/configuration/app-config').set({
  rootPath: path.join(__dirname, '../')
});

module.exports = function() {
  // Default asynchronous step timeout to 10 seconds
  this.setDefaultTimeout(10 * 1000);

  this.World = function World() {
    this.appPort = process.env.PORT || 3000;

    /**
     * Remove any specs and data already in place.
     *
     * @return promise for operation completion.
     */
    this.deleteProjectData = function() {
      return new Promise(function(resolve, reject) {
        fs.remove(appConfig.projectsPath, function (err) {
          if (err) {
            return reject(err);
          }

          resolve();
        });
      });
    };
  };
};
