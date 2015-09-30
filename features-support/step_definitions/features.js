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

      if (world.statusCode === 500 || world.statusCode === 404) {
        var responseError = new Error("Project retrieval error.\n" + world.body);
        responseError.code = world.statusCode;
        callback(responseError);
        return;
      }

      // We're done.
      callback();
    });
}

// The returned function is passed as a callback to getProjectFromUrl.
function getScenarioFromProject(callback, world) {
  return function(error) {
    var firstFeatureLink;

    if (error) {
      callback(error)
    }

    // Get a link to an individual feature.
    try {
      firstFeatureLink = (/class="spec-link" href="([\w\/.?=-]+\.feature[\w\/.?=-]+)"/.exec(world.body))[1];
    } catch(error) {
      callback(error);
    }

    var featureUrl = 'http://localhost:' + world.appPort + firstFeatureLink;

    // Follow the link.
    request.get(featureUrl, function(error, response, body) {
      if (error) {
        callback(error);
        return;
      }

      world.statusCode = response.statusCode;
      world.body = body;
      callback();
    });
  }
}

module.exports = function () {

  this.Then(/^the list of features will be visible\.?$/, function (callback) {
    should.equal(this.statusCode, 200, "Bad HTTP status code: " + this.statusCode + "\nBody:\n" + this.body);
    should.equal(
      /\.feature/i.test(this.body) && /\.md/i.test(this.body),
      true,
      "The returned document body does not contain the strings '.feature' and '.md'");
    callback();
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

  this.When(/^an interested party wants to view the scenarios within a feature\.?$/, function (callback) {
    var world = this;
    getProjectFromUrl.bind(world)(getScenarioFromProject(callback, world));
  });
};
