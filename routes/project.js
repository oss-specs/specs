'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

var handlebars = require('hbs').handlebars;

var arrrayToTree = require('file-tree');
var TreeModel = require('tree-model');

var processFiles = require('../lib/specifications/files/process-files');
var filterByTag = require('../lib/specifications/files/feature-files/tags').filter;

var getProject = require('../lib/specifications/projects/project').get;
var getProjectData = require('../lib/specifications/projects/project').getData;
var getFileContent = require('../lib/specifications/projects/project').getFileContent;

var applyView = require('../lib/specifications/projects/views').applyView;

var appConfig = require('../lib/configuration/app-config').get();


/**
 * Conditionally add edit link data to file objects.
 * @param {Object} projectData  The project data.
 * @return {Object}             The modified project data.
 */
function addEditLinks(projectData) {
  if (projectData.config.editUrlFormat) {
    projectData.files.forEach(function(file) {
      var editUrlTemplate = handlebars.compile(projectData.config.editUrlFormat);
      var editUrl = editUrlTemplate({
        repoUrl: projectData.repoUrl,
        repoUrlWithoutGitSuffix: projectData.repoUrl.replace(/\.git$/i, ''),
        branchName: projectData.currentShortBranchName,
        pathToFile: file.filePath
      });

      file.editUrl = editUrl;
    });
  }
  return projectData;
}

// Render the project page and send to client.
function getRender(res, appConfig, renderOptions) {
  return function render(projectData) {
    var renderingData = {};

    // The tags object associated with this project.
    var projectTags = {};

    renderingData.openBurgerMenu = renderOptions.openBurgerMenu;
    renderingData.currentViewName = renderOptions.currentViewName;

    // Handle no project data being found.
    if (!projectData) {
      res.render('project', renderingData);
      return;
    }

    // Create a reference to the project data on
    // the object that will be passed to the
    // template.
    renderingData.project = projectData;

    // If there are no files in the project then don't
    // try and get file contents.
    if (!projectData.files.length) {
      res.render('project', renderingData);
      return;
    }

    // Applying views from configuration.
    // Chrome hasn't turned destructuring assignment on yet,
    // so I'm cheating
    let ret = applyView(projectData, renderingData);
    projectData = ret[0];
    renderingData = ret[1];

    // Configure function for mapping file paths to file data and use it.
    var pathToData = processFiles.getFilePathToFileObject(appConfig.projectRoute, projectData, getFileContent);
    projectData.files = projectData.files.map(pathToData);


    // Wait for content promises to resolve.
    // We don't actually care about the promise values here, they are already
    // part of the file object, we just need them all fulfilled or rejected.
    var promisesForFileContent = projectData.files.map(function(f) {return f.contentPromise;});
    return Promise.all(promisesForFileContent)
      .then(function() {

        // Mix in the file content.
        projectData.files = projectData.files.map(processFiles.processFileContent);

        // Conditionally add the edit links to individual files.
        projectData = addEditLinks(projectData);

        // Filer the features and scenarios by requested tag name.
        let ret = filterByTag(projectData, projectTags, renderOptions.currentTags);
        projectData = ret[0];
        projectTags = ret[1];

        /*
          Generate a tree data structure from the flat file list.
          The rest of this function is part of the
          callback to arrrayToTree.
         */
        var fileList = projectData.files.map(function(file) { return file.filePath; });
        arrrayToTree(fileList, function(filePath, next) {

          // Fix the assumption in file-tree that we are dealing with actual
          // files on disk.
          filePath = path.relative(appConfig.rootPath, filePath);

          // Use a loop to find the file matching this part of the tree.
          var currentFile = projectData.files.filter(function(file) {
            return filePath === file.filePath;
          })[0];

          // Link the file list and the tree structure by reference.
          var leaf = {
            name: filePath,
            file: currentFile,
            isFile: true
          };

          // Continue to generate the tree.
          next(null, leaf);
        }, function(err, fileTree) {

          // Tree generation is complete.
          // Wrap in tree model convenience object.
          var treeRoot = (new TreeModel()).parse({name: 'root', children: fileTree});

          // Use the tree to construct sets of files grouped by parent directory.
          var filesByDir = {};
          var fileNodes = treeRoot.all(function(node) { return node.model.isFile; });
          fileNodes.forEach(function(fileNode) {
            var pathToNode = fileNode.getPath();

            // Derive a directory path.
            var directoryNames = pathToNode
                                  .map(function(node) {
                                    var model = node.model;
                                    if (!node.isRoot() && !model.isFile) {
                                      return node.model.name;
                                    }
                                    return '';
                                  });
            var directoryPath = path.join.apply(path, directoryNames);

            // Store the file data keyed by containing directory.
            if (!filesByDir[directoryPath]) {
              filesByDir[directoryPath] = [];
            }
            filesByDir[directoryPath].push(fileNode.model.file);
          });

          // Reference the finished file tree on the rendering data object.
          renderingData.project.filesByDir = filesByDir;

          // Render the page.
          res.render('project', renderingData);
        });
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

  // Cookie variables.
  var openBurgerMenu = (req.cookies.specsOpenBurgerMenu === 'true');

  // Session variable.
  if(!req.session.branches) {
    req.session.branches = {};
  }
  var sessionBranches = req.session.branches;

  // The repository name from the URL.
  var repoName = req.params[0];

  // Query param indicating a particular ref should
  // be used when retrieving repo data.
  var targetBranchName = req.query.branch || false;

  // Query param causing a Git fetch.
  var projectShouldUpdate = (req.query.update === 'true');

  // Query parameter containing desired named view from project config.
  var currentViewName = req.query.view || false;

  // Query parameter containing desired feature tags to filer on.
  var currentTags = req.query.tags || false;
  if (currentTags === 'none') {
    currentTags = false;
  }

  // Create rendering options.
  var renderOptions = {
    openBurgerMenu: openBurgerMenu,
    currentViewName: currentViewName,
    currentTags: currentTags
  };

  // Create the render and passError functions.
  var configuredRender = getRender(res, appConfig, renderOptions);
  var configuredPassError = getPassError(next);

  // TODO: Have one place this object is created.
  var projectData = {
    repoName: repoName,
    localPathRoot: appConfig.projectsPath
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
