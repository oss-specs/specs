'use strict';

var request = require('request');
var should = require('should');
var By = require('selenium-webdriver').By;

// Test helper.
function getProjectFromUrl(callback) {
  var world = this;
  var projectRetrievalUrl = 'http://localhost:' + world.appPort + '/?repo_url=' + encodeURIComponent(world.repoUrl);

  world.browser.get(projectRetrievalUrl)
  .then(world.browser.getPageSource.bind(world.browser))
  .then(function (body) {
      world.body = body;
      callback();
  });
}

// The returned function is passed as a callback to getProjectFromUrl.
function getScenarioFromProject(callback, world) {
  return function(error) {
    var featureLinks = [];
    var featureLink;

    if (error) {
      callback(error);
      return;
    }

    world.browser.findElements(By.css('.spec-link'))
    .then(function (specLinks) {
      var featureUrl = 'http://localhost:' + world.appPort + featureLink;

      var featureLink = specLinks[specLinks.length - 1];

      return world.browser.get(featureLink.getAttribute('href'))
    })
    .then(world.browser.getPageSource.bind(world.browser))
    .then(function (body) {
        world.body = body;
        callback();
    });
  };
}

module.exports = function () {

  this.Then(/^the list of features will be visible\.?$/, function (callback) {

    should.equal(
      /\.feature/i.test(this.body) && /\.md/i.test(this.body),
      true,
      'The returned document body does not contain the strings \'.feature\' and \'.md\'' + this.body);
    callback();
  });

  this.Then(/^the scenarios will be visible\.?$/, function (callback) {
    should.equal(/feature-title/i.test(this.body),
      true,
      'The returned document body does not contain a feature title');
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
