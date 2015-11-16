'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

var handlebars = require('hbs').handlebars;

var Gherkin = require('gherkin');
var Parser = new Gherkin.Parser();
var markdown = require('markdown').markdown;

var arrrayToTree = require('file-tree');
var TreeModel = require('tree-model');

var getProject = require('../lib/specifications/project').get;
var getProjectData = require('../lib/specifications/project').getData;
var getFileContents = require('../lib/specifications/project').getFileContents;

var appConfig = require('../lib/configuration').get();

// Given a file path, generate additional data or promises for data.
function getFilePathToFileData(appConfig, projectData, getFileContents) {
  return function filePathToFileData(filePath) {
    var file = {};

    file.name = path.basename(filePath);
    file.filePath = filePath;

    file.route = path.posix.join(appConfig.projectRoute, projectData.repoName, filePath);

    file.isFeatureFile = /.*\.feature/.test(filePath);
    file.isMarkdownFile = /.*\.md/.test(filePath);

    if (file.isFeatureFile || file.isMarkdownFile) {
      file.contentsPromise = getFileContents(projectData, filePath);
    } else {
      file.contentsPromise = undefined;
    }

    return file;
  };
}

// Given some file content process it into the relevant data structure.
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

    return file;
  };
}

// Render the project page and send to client.
function getRender(res, appConfig, renderOptions) {
  return function render(projectData) {
    var renderingData = {};
    var view = {};
    var viewNames = [];
    var currentView;

    renderingData.openBurgerMenu = renderOptions.openBurgerMenu;

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

    // If the project config contains specified views use them.
    currentView = renderOptions.currentView;
    if (projectData.config) {
      viewNames = Object.keys(projectData.config.views);
    }

    if (viewNames.length > 0) {
      renderingData.hasViews = true;

      // No view specified, attempt to use a DEFAULT view.
      if (currentView === false) {
        // The defaultView value may be undefined, that will result in no view logic being applied.
        currentView = viewNames
                        .filter(function(name) {
                          return !!projectData.config.views[name].default;
                        })[0] || false;
      }

      // Generate view name data for the UI.
      renderingData.viewNames = viewNames.map(function (viewName) {
        return {
          name: viewName,
          urlEncodedName: encodeURIComponent(viewName),
          isCurrent: viewName === currentView
        };
      });

      // Explicit request for no view logic to be applied.
      if (currentView === 'none') {
        view = renderingData.view = false;

      // Grab any view config that might have been specified in the project config.
      } else {
        view = renderingData.view = projectData.config.views[currentView];
      }

      // Filter the file list based on the excludedPaths in project config.
      if (view && view.hasExcludedPaths) {
        projectData.files = projectData.files.filter(view.helpers.isIncludedPath);
      }

      // Filter the file list based on the anchor path in the project config.
      if (view && view.hasAnchor) {
        projectData.files = projectData.files.filter(view.helpers.isWithinAnchor);
      }
    }

    // Configure function for mapping file paths to file data.
    var pathToData = getFilePathToFileData(appConfig, projectData, getFileContents);

    // Make a copy of the simple file list before modifying it.
    var fileList = projectData.files.slice();

    // Map list of file paths to list of file data objects.
    projectData.files = projectData.files.map(pathToData);

    // Wait for content promises to resolve then mix
    // in the resolved file content.
    var promisesForFileContent = projectData.files.map(function(f) {return f.contentsPromise;});
    return Promise.all(promisesForFileContent)
      .then(function(fileContents) {

        // Mix in the file content.
        projectData.files = projectData.files.map(getProcessFileContent(fileContents));


        console.log("&&&")
        console.log(projectData.config);

        // If the project config contains a URL format
        // for creating links to edit files then grab it.
        if (projectData.config.editUrlFormat) {
          projectData.files.forEach(function(file) {
            var editUrlTemplate = handlebars.compile(projectData.config.editUrlFormat);

            console.log("*****")
            console.log(projectData.config.editUrlFormat);
            console.log(projectData.repoUrl)

            var editUrl = editUrlTemplate({
              repoUrl: projectData.repoUrl,
              branchName: projectData.currentShortBranchName,
              pathToFile: file.filePath
            });
            editUrl = path.posix.normalize(editUrl);

            file.editUrl = editUrl;
          });
        }

        // Generate a file tree data structure.
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

          // Use the tree to construct a set of files by directory.
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
          renderingData['project'].filesByDir = filesByDir;

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
  if(!req.session.branches) req.session.branches = {};
  var sessionBranches = req.session.branches;

  // The repository name from the URL.
  var repoName = req.params[0];

  // Query param indicating a particular ref should
  // be used when retrieving repo data.
  var targetBranchName = req.query.branch || false;

  // Query param causing a Git fetch.
  var projectShouldUpdate = (req.query.update === 'true');

  // Query parameter containing desired named view from project config.
  var currentView = req.query.view || false;

  // Create rendering options.
  var renderOptions = {
    openBurgerMenu: openBurgerMenu,
    currentView: currentView
  };

  // Create the render and passError functions.
  var configuredRender = getRender(res, appConfig, renderOptions);
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
