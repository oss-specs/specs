var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io

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
      .done();;
  });

  this.When(/^an interested party attempts to view them$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^the specifications should be visible$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });
}
