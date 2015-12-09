'use strict';

var should = require('should');
var By = require('selenium-webdriver').By;

const pageLoadTimeout = 30 * 1000;
const timeoutObject = {timeout: pageLoadTimeout};

// Deal with the non-standard webdriver promises.
function handleErr(cb) {
  return function(err) {
    cb(err);
  };
}

/**
 * Given parameters on the world object, load a URL.
 * @param  {Function} callback Cucumber done callback OR a custom callback.
 * @return {undefined}
 * @this World
 */
function getProjectFromUrl(callback) {
  var world = this;
  var projectRetrievalUrl = 'http://localhost:' + world.appPort + '/?repo_url=' + encodeURIComponent(world.repoUrl);

  world.browser.get(projectRetrievalUrl)
  .then(world.browser.getPageSource.bind(world.browser), handleErr(callback))
  .then(function (body) {
    world.body = body;
    callback();
  }, handleErr(callback));
}

// The returned function is passed as a callback to getProjectFromUrl.
function getScenarioFromProject(callback, world) {
  return function(error) {
    if (error) {
      callback(error);
      return;
    }

    world.browser.findElements(By.css('.spec-link'))
    .then(function (specLinks) {
      var featureLink = specLinks[specLinks.length - 1];
      return world.browser.get(featureLink.getAttribute('href'));
    }, handleErr(callback))
    .then(world.browser.getPageSource.bind(world.browser), handleErr(callback))
    .then(function (body) {
      world.body = body;
      callback();
    }, handleErr(callback));
  };
}

module.exports = function () {

  this.Given(/^a URL representing a remote Git repo "([^"]*)"$/, function (repoUrl, callback) {
    this.repoUrl = repoUrl;
    callback();
  });


  this.When(/^an interested party wants to view the features in that repo\.?$/, timeoutObject, getProjectFromUrl);
  this.When(/^they request the features for the same repository again\.?$/, timeoutObject, getProjectFromUrl);
  this.When(/^an interested party wants to view the scenarios within a feature\.?$/, timeoutObject, function (callback) {
    var world = this;
    getProjectFromUrl.bind(world)(getScenarioFromProject(callback, world));
  });

  this.When(/^they decide to change which branch is being displayed$/, function (callback) {
    var world = this;
    var burgerMenuId = 'expand-collapse-repository-controls';
    var repositoryCongtrolsId = 'repository-controls';
    var projectShaElId = 'project-commit';
    var changeBranchSelectElId = 'change-branch-control';
    var testingBranchOptionValue = 'refs%2Fremotes%2Forigin%2Ftest%2FdoNotDelete';
    var burgerMenuEl;
    var repoControlsEl;


    // Get the burger menu element.
    world.browser.findElement(By.id(burgerMenuId))
      .then(function(_burgerMenuEl) {
        burgerMenuEl = _burgerMenuEl;
        return world.browser.findElement(By.id(repositoryCongtrolsId));

      // Get the repo controls element.
      }, handleErr(callback))
      .then(function(_repoControlsEl) {
        repoControlsEl = _repoControlsEl;
        return repoControlsEl.getAttribute('class');

      // Open the repo controls.
      }, handleErr(callback))
      .then(function(repoControlsClass) {
        var isClosed = repoControlsClass.indexOf('collapse') !== -1;
        if (isClosed) {
          return burgerMenuEl.click();
        }
        return;

      // Grab the current SHA
      }, handleErr(callback))
      .then(function() {
        return world.browser.findElement(By.id(projectShaElId));
      }, handleErr(callback))
      .then(function(_projectShaEl) {
        return _projectShaEl.getText();
      }, handleErr(callback))
      .then(function(originalSha) {
        world.oringalSha = originalSha;

        // Grab the branch selecting control.
        return world.browser.findElement(By.id(changeBranchSelectElId));

      // Request to change branch.
      }, handleErr(callback))
      .then(function(_changeBranchSelectEl) {
        return _changeBranchSelectEl.findElement(By.xpath('option[@value=\'' + testingBranchOptionValue + '\']'));
      }, handleErr(callback))
      .then(function(_testBranchOptionEl) {
        _testBranchOptionEl.click();
        callback();
      }, handleErr(callback));
  });


  this.Then(/^the list of features will be visible\.?$/, function () {
    should.equal(
      /\.feature/i.test(this.body) && /\.md/i.test(this.body),
      true,
      'The returned document body does not contain the strings \'.feature\' and \'.md\'' + this.body);
  });

  this.Then(/^the scenarios will be visible\.?$/, function () {
    should.equal(/feature-title/i.test(this.body),
      true,
      'The returned document body does not contain a feature title');
  });

  // This has to wait for a page to load so it gets the page load time out.
  this.Then(/^the files from the selected branch are displayed\.$/, timeoutObject, function (callback) {
    var world = this;

    var projectShaElId = 'project-commit';


    // Get the new SHA.
    world.browser.findElement(By.id(projectShaElId))
      .then(function(_projectShaEl) {
        return _projectShaEl.getText();
      }, handleErr(callback))
      .then(function(newSha) {
        should.notEqual(newSha, world.oringalSha, 'The SHA did not change on changing branch.');
        callback();
      }, handleErr(callback));
  });
};
