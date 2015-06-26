var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io
var request = require('request');

module.exports = function () {

  this.Given(/^a set of specifications exists$/, function (callback) {
    /**
     * Copy this repo's features files to a public directory for serving.
     */

    // Remove old files.
    fs.removeTree('public/test-feature-files/')
      .then(function() {
        return fs.copyTree('features', 'public/test-feature-files/');
      })

      // We are done.
      .then(function(val) {
          callback();
      })

      // Pass unhandled errors to the test framework.
      .catch(function(err) {
        callback(err);
      })

      // End the promise chain.
      .done();
  });

  this.When(/^an interested party attempts to view them$/, function (callback) {
    var world = this;
    request
      .get('http://localhost:3000', function(error, response, body) {
        world.statusCode = response.statusCode;
        world.body = body;
        callback();
      });
  });

  this.Then(/^the specifications should be visible$/, function (callback) {
    if (this.statusCode === 200 && /feature/.test(this.body)) {
      callback();
    } else {
      callback("Got response: status code: " + this.statusCode + ". Body: " + this.body);
    }
  });
}
