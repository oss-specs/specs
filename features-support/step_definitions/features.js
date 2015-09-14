"use strict";
/* eslint new-cap: 0 */

var request = require('request');
var should = require('should');

// Test helper.
function getProjectFromUrl(callback) {
  var world = this;
  var projectRetrievalUrl = 'http://localhost:' + world.appPort + '/?repo_url=' + encodeURIComponent(world.repoUrl);
  request
    .get(projectRetrievalUrl, function(error, response, body) {
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
}

// Cache the state of the static test data
// at the module level (on first require).
var fakeProjectMetadataExists;
var fakeProjectMetadata =  {
  repoName: 'made-up',
  repoUrl: 'http//example.com',
  head: 'testing!',
  localPath: 'not/a/real/path',
  currentBranchName: 'notARealBranch'
};

function getFakeProjectUrl(appPort, projectName) {
  return 'http://localhost:' + appPort + '/' + projectName;
}

module.exports = function () {

  // Create static test data, only do this once.
  this.Given(/^a set of specifications containing at least one feature file\.?$/, function (callback) {
    var world = this;

    // Only generate the static test data once for the feature
    // as opposed to the @cleanSlate tag which removes it for
    // each scenario.
    if (fakeProjectMetadataExists) {
      callback();
      return;
    }

    // Make sure the test data is removed.
    world.deleteTestSpecs()
      .then(function() {
        return world.createSpecsForTesting(fakeProjectMetadata);
      })
      .then(function() {
        fakeProjectMetadataExists = true;
        callback();
      })
      .catch(function(err) {
        callback(err);
      });
  });

  this.When(/^an interested party attempts to view them\.?$/, function (callback) {
    var world = this;
    var fakeProjectUrl = getFakeProjectUrl(world.appPort, fakeProjectMetadata.repoName);
    request
      .get(fakeProjectUrl, function(error, response, body) {
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

  this.Then(/^the list of features will be visible\.?$/, function (callback) {
    should.equal(this.statusCode, 200, "Bad HTTP status code: " + this.statusCode + "\nBody:\n" + this.body);
    should.equal(
      /\.feature/i.test(this.body) && /\.md/i.test(this.body),
      true,
      "The returned document body does not contain the strings '.feature' and '.md'");
    callback();
  });

  this.Given(/^a list of feature files is displayed\.?$/, function (callback) {
    var world = this;
    var fakeProjectUrl = getFakeProjectUrl(world.appPort, fakeProjectMetadata.repoName);
    request.get(fakeProjectUrl, function(error, response, body) {
      if (error) {
        callback(error);
        return;
      }
      world.firstFeatureLink = (/class="spec-link" href="([\w\/.-]+)\.feature"/.exec(body))[1];
      callback();
    });
  });

  this.When(/^an interested party wants to view the scenarios within that feature file\.?$/, function (callback) {
    var world = this; // the World variable is passed around the step defs as `this`.
    var featurePath = 'http://localhost:' + world.appPort + '/' + world.firstFeatureLink;

    request
      .get(featurePath, function(error, response, body) {
        if (error) {
          callback(error);
          return;
        }
        world.statusCode = response.statusCode;
        world.body = body;
        callback();
      });
  });

  this.Then(/^the scenarios will be visible\.?$/, function (callback) {
    should.equal(this.statusCode, 200, "Bad HTTP status code: " + this.statusCode + "\nBody:\n" + this.body);
    should.equal(/feature:/i.test(this.body),
      true,
      "The returned document body does not contain the word 'feature'");
    callback();
  });

  this.Given(/^a URL representing a remote Git repo "([^"]*)"$/, function (repoUrl, callback) {
    this.repoUrl = repoUrl;
    callback();
  });

  this.When(/^an interested party wants to view the features in that repo\.?$/, getProjectFromUrl);
  this.When(/^they request the features for the same repository again\.?$/, getProjectFromUrl);
};
