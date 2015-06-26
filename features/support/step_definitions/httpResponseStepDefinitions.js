var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io
var request = require('request');

var paths = {
  features: 'features',
  public: 'public/test-feature-files/'
};

module.exports = function () {

  this.Given(/^a set of specifications exists$/, function (callback) {
    /**
     * Copy this repo's features files to a public directory for serving.
     */

    // Remove old files.
    fs.removeTree(paths.public)
      .catch(function(err) {
        // Ignore failure to unlink missing directory.
        if (err.code !== 'ENOENT') throw err;
      })
      .then(function() {
        return fs.makeTree(paths.public);
      })
      .then(function() {
        return fs.copyTree(paths.features, paths.public);
      })

      // We are done.
      .then(function() {
          callback();
      })

      // Pass unhandled errors to the test framework.
      .catch(function(err) {
        callback(err);
      });
  });

  this.When(/^an interested party attempts to view them$/, function (callback) {
    var world = this;
    fs.listTree(paths.public, function guard(path, stat) {
      return /\.feature$/.test(path);
    })
    .then(function(featureFiles) {
      var featureFile = featureFiles[0];
      request
        .get('http://localhost:3000/' + featureFile, function(error, response, body) {
          if (error) {
            callback(error);
            return;
          }
          world.statusCode = response.statusCode;
          world.body = body;
          callback();
        });
      })
      .catch(function(err) {
        callback(err);
      });
  });

  this.Then(/^the specifications should be visible$/, function (callback) {
    if (this.statusCode === 200 && /feature/i.test(this.body)) {
      callback();
    } else {
      callback("Got response: status code: " + this.statusCode + ". Body: " + this.body);
    }
  });
}
