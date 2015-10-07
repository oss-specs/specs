'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();
var Q = require('q');

var Gherkin = require('gherkin');
var Parser = new Gherkin.Parser();
var markdown = require('markdown').markdown;

var appConfig = require('../lib/configuration').get();
var getProject = require('../lib/specifications/project').get;
var getProjectData = require('../lib/specifications/project').getData;
var getFileContents = require('../lib/specifications/project').getFileContents;

// Render the project page and send to client.
function getRender(res, appConfig) {
  return function render(projectData) {
    var fileContentsPromises = [];

    var data = {
      renderingOptions: {}
    };

    if (projectData) {
      data['project'] = projectData;
    }

    // Construct the routes for each file of interest.
    data.project.files.forEach(function(file) {
      var fileName = file.fileName;
      file.route = path.posix.join(appConfig.projectRoute, projectData.repoName, fileName);
      file.isFeatureFile = /.*\.feature/.test(fileName);
      file.isMarkdownFile = /.*\.md/.test(fileName);
      if (file.isFeatureFile || file.isMarkdownFile) {
        fileContentsPromises.push(getFileContents(projectData, fileName));
      } else {
        fileContentsPromises.push(undefined);
      }
    });

    Q.all(fileContentsPromises)
      .then(function(fileContents) {
        data.project.files.forEach(function(file, index) {
          if (file.isFeatureFile) {
            file.data = Parser.parse(fileContents[index]);
          } else if(file.isMarkdownFile) {
            file.data = markdown.parse(fileContents[index]);
          } else {
            file.data = false;
          }
        });

        res.render('project', data);
      });
  };
}

// Pass errors to the next Express middleware for handling.
function getPassError(next) {
  return function passError(err) {
    next(err);
  };
}

// List of available features in a project.
router.get(/^\/([^\/]+)$/, function(req, res, next) {

  // Session variable.
  if(!req.session.branches) req.session.branches = {};
  var sessionBranches = req.session.branches;

  // The repository name from the URL.
  var repoName = req.params[0];

  // Query param indicating a particular ref should
  // be used when retrieving repo data.
  var targetBranchName = req.query.branch || false;

  // Query param causing a Git update (pull).
  var projectShouldUpdate = (req.query.update === 'true');

  // Create the render and passError functions.
  var configuredRender = getRender(res, appConfig);
  var configuredPassError = getPassError(next);

  // TODO: Have one place this object is created.
  var projectData = {
    repoName: repoName,
    projectLink: path.posix.join(appConfig.projectRoute, repoName),
    localPath: path.join(appConfig.projectsPath, repoName)
  };

  // Perform a clone or fetch on the repo then get the data.
  // If this switch is set then the branch will not change.
  if (projectShouldUpdate) {

    // Set the current branch name which will be used in the update.
    // If not supplied the repo default branch will be used.
    projectData.currentBranchName = sessionBranches[repoName] || false;

    // Update the repo and get the repo data.
    getProject(projectData)
      .then(configuredRender)
      .catch(configuredPassError);

  // Change the branch.
  } else if (targetBranchName && targetBranchName !== sessionBranches[repoName]) {
    getProjectData(projectData, targetBranchName)
      .then(function(projectData) {

        // The data for the target branch was retrieved succesfully,
        // Update the branch session variable. Done here rather than
        // earlier to avoid bad requests (nonsense refs) persisting.
        sessionBranches[repoName] = projectData.currentBranchName;
        return projectData;
      })
      .then(configuredRender)
      .catch(configuredPassError);

  // Else, generate the metadata and render the page.
  } else {
    getProjectData(projectData, sessionBranches[repoName])
      .then(configuredRender)
      .catch(configuredPassError);
  }
});

module.exports = router;
