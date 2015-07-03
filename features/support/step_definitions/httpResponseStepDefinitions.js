"use strict";
/* eslint new-cap: 0 */

var should = require('should');
var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io
var request = require('request');

var paths = {
  features: 'features',
  public: 'public/feature-files/'
};

/**
 * Copy this repo's features files to a public directory.
 */
function createSpecsForTesting(callback) {
  callback = callback || function(){};

  // Remove old files.
  fs.removeTree(paths.public)
    .catch(function(err) {
      // Ignore failure to unlink missing directory.
      if (err.code !== 'ENOENT') {
        throw err;
      }
    })

    // Make the target directory for static feature files
    // in the static assets 'public' directory.
    .then(function() {
      return fs.makeTree(paths.public);
    })
    // Copy over the feature files.
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
}

module.exports = function () {

  this.Given(/^a set of specifications containing at least one feature file$/, function (callback) {
    createSpecsForTesting(callback);
  });

  this.When(/^an interested party attempts to view them$/, function (callback) {
    var world = this;
    request
      .get('http://localhost:3000/', function(error, response, body) {
        if (error) {
          callback(error);
          return;
        }

        // Store the relevant information on the world object for testing.
        world.statusCode = response.statusCode;
        world.body = body;

        // We're done.
        callback();
      });
  });

  this.Then(/^the list of feature files will be visible$/, function (callback) {
    should.equal(this.statusCode, 200, "Bad HTTP status code.");
    should.equal(/feature/i.test(this.body),
      true,
      "The returned document body does not contain the word 'feature'");
    callback();
  });

  this.When(/^an interested party wants to view the scenarios within a feature file$/, function (callback) {
    var world = this; // the World variable is passed around the step defs as `this`.
    request
      .get('http://localhost:3000/', function(error, response, body) {
        if (error) {
          callback(error);
          return;
        }
        var firstLink = (/href="([\w\/-]+)"/.exec(body))[1];
        request
          .get('http://localhost:3000/' + firstLink, function(error, response, body) {
            if (error) {
              callback(error);
              return;
            }
            world.statusCode = response.statusCode;
            world.body = body;
            callback();
          });
      });
  });

  this.Then(/^the scenarios will be visible\.$/, function (callback) {
    should.equal(this.statusCode, 200, "Bad HTTP status code.");
    should.equal(/feature/i.test(this.body),
      true,
      "The returned document body does not contain the word 'feature'");
    callback();
  });

};
