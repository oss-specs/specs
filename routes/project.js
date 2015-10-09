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

function getProcessFileContent(fileContents) {
  return function processFileContent(file, index) {
    var fileContent = fileContents[index];

    if (!fileContent || !fileContent.length) {
      file.empty = true;
    }

    if (file.isFeatureFile) {
      try {
        file.data = Parser.parse(fileContent);
      } catch (err) {
        file.error = err;
      }
    } else if(file.isMarkdownFile) {
      file.data = markdown.parse(fileContent);
    } else {
      file.data = false;
    }
  };
}


// Render the project page and send to client.
function getRender(res, appConfig) {
  return function render(projectData) {
    var fileContentsPromises = [];

    var renderingData = {};

    // Handle no project data being found.
    if (!projectData) {
      res.render('project', renderingData);
      return;
    }

    renderingData['project'] = projectData;

    // If there are no files in the project then don't
    // try and get file contents.
    if (!projectData.files.length) {
      res.render('project', renderingData);
      return;
    }

    // Construct additional data from each file Path
    projectData.files = projectData.files.map(function(filePath) {
      var file = {};

      file.filePath = filePath;
      file.fileName = path.basename(filePath);

      file.route = path.posix.join(appConfig.projectRoute, projectData.repoName, filePath);

      file.isFeatureFile = /.*\.feature/.test(filePath);
      file.isMarkdownFile = /.*\.md/.test(filePath);

      if (file.isFeatureFile || file.isMarkdownFile) {
        fileContentsPromises.push(getFileContents(projectData, filePath));
      } else {
        fileContentsPromises.push(undefined);
      }

      return file;
    });

    // Mix in the resolved file content and render.
    Q.all(fileContentsPromises)
      .then(function(fileContents) {
        renderingData.project.files.forEach(getProcessFileContent(fileContents));
        res.render('project', renderingData);
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
