"use strict";

var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io
var path = require('path');

// Get the project metadata module so we can inject test data.
var projectMetaData = require('../lib/specifications/projectMetaData');
var featureFileRoot = path.join(__dirname, '..', 'public', 'feature-files');

module.exports = function() {
  this.World = function World(callback) {
    this.appPort = process.env.PORT || 3000;
    this.paths = {
      features: path.join('features'),
      public: path.join('public', 'feature-files'),
      data: path.join('project-data')
    };

    /**
     * Copy this repo's features files to a public directory
     * for use as test data.
     *
     * @return Promise for operation completion.
     */
    this.createSpecsForTesting = function createSpecsForTesting(fakeProjectMetadata) {
      var world = this;
      return fs.makeTree(world.paths.public)
        .then(function() {
          var fakeProjectPath = path.join(world.paths.public, fakeProjectMetadata.repoName);
          return fs.copyTree(world.paths.features, fakeProjectPath);
        })
        .then(function() {

          // Configure the metadata module with the feature file storage path.
          var configuredDeriveAndStore = projectMetaData.deriveAndStore(featureFileRoot);

          // Pass an object of made up repo data to be decorated with
          // feature file paths and return a promise for completion
          // of storage of that data.
          return configuredDeriveAndStore(fakeProjectMetadata);
        });
    };

    /**
     * Remove any specs and data already in place.
     *
     * @return promise for operation completion.
     */
    this.deleteTestSpecs = function() {
      var world = this;
      return fs.removeTree(world.paths.public)
        .then(function() {
          return fs.removeTree(world.paths.data);
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
