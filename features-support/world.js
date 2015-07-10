"use strict";

var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io

module.exports = function() {
  this.World = function World(callback) {
    this.paths = {
      features: 'features',
      public: 'public/feature-files/'
    };

    /**
     * Copy this repo's features files to a public directory
     * for use as test data.
     *
     * @return Promise for operation completion.
     */
    this.createSpecsForTesting = function createSpecsForTesting() {
      var world = this;
      return fs.makeTree(world.paths.public)
        .then(function() {
          return fs.copyTree(world.paths.features, world.paths.public);
        });
    };

    /**
     * @return promise for operation completion.
     */
    this.deleteTestSpecs = function() {
      var world = this;
      return fs.removeTree(world.paths.public)
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
