'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

var handlebars = require('hbs').handlebars;

var arrrayToTree = require('file-tree');
var TreeModel = require('tree-model');

var processFiles = require('../lib/specifications/files/process-files');

var getProject = require('../lib/specifications/projects/project').get;
var getProjectData = require('../lib/specifications/projects/project').getData;
var getFileContents = require('../lib/specifications/projects/project').getFileContents;

var countTags = require('../lib/specifications/files/feature-files/tags').count;

var appConfig = require('../lib/configuration/app-config').get();


// Render the project page and send to client.
function getRender(res, appConfig, renderOptions) {
  return function render(projectData) {
    var renderingData = {};
    var view = {};
    var viewNames = [];
    var currentView;
    var projectTags = {};

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

    /*
      Applying views from configuration.
     */

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


    /*
      Getting file content and rendering.
     */

    // Configure function for mapping file paths to file data.
    var pathToData = processFiles.getFilePathToFileData(appConfig.projectRoute, projectData, getFileContents);

    // Map list of file paths to list of file data objects.
    projectData.files = projectData.files.map(pathToData);

    // Wait for content promises to resolve.
    // We don't actually care about the promise values here, they are already
    // part of the file object, we just need them all fulfilled or rejected.
    var promisesForFileContent = projectData.files.map(function(f) {return f.contentPromise;});
    return Promise.all(promisesForFileContent)
      .then(function(fileContents) {
        var tagNames = [];

        // Mix in the file content.
        projectData.files = projectData.files.map(processFiles.processFileContent);


        // If the project config contains a URL format
        // for creating links to edit files then grab it.
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


        /*
          Applying filtering based on feature and scenario tags.
         */

        var currentTags = renderOptions.currentTags;
        // Count the tags in the project.
        projectData.files.forEach(function(file) {
          if (!file.isFeatureFile || file.error) {
            return;
          }

          // This counts tags and marks when an
          // object contains the requested tag.
          projectTags = countTags(file.data, projectTags, currentTags);
        });
        tagNames = Object.keys(projectTags);
        projectData.hasTags = !!tagNames.length;
        // Mark the currently requested tag if any,
        // this is used to set the selected option
        // in the tag select box.
        tagNames.forEach(function(name) {
          // Currently on one tag is passed in the query parameter.
          if (name === currentTags) {
            projectTags[name].isCurrent = true;
          }
        });
        projectData.tags = projectTags;

        // Filter the features and scenarios based on
        // whether they contain the requested tag.
        if (currentTags) {
          projectData.files = projectData.files.filter(function(file) {
            var feature;
            var featureScenarioContainsTag = false;

            // Filter out non-feature or erroring files.
            if (!file.isFeatureFile || file.error) {
              return false;
            }

            // If the feature contains the tag keep it and take no
            // further action.
            feature = file.data;
            if (feature.containsRequestedTag) {
              return true;
            }

            feature.scenarioDefinitions.forEach(function (scenario, index, defs) {

              // if any example contains the tag keep all examples.
              if (scenario.type === 'ScenarioOutline') {
                scenario.examples.forEach(function(example) {
                  if (example.containsRequestedTag) {
                    scenario.containsRequestedTag = true;
                  }
                });
              }
              if (scenario.containsRequestedTag) {
                featureScenarioContainsTag = true;
              } else {
                // Set the scenario to undefined so it won't be rendered.
                defs[index] = undefined;
              }
            });
            // Remove undefined scenarios because handlbars' `each`
            // helper doen't ignore undefined array elements.
            feature.scenarioDefinitions = feature.scenarioDefinitions.filter(function(scenario) { return scenario !== undefined; });

            // Retain or lose the feature depending on whether a scenario
            // contained the requested tag.
            return featureScenarioContainsTag;
          });
        }


        /*
          Generate a tree data structure from the flat file list.
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

  // Query parameter containing desired feature tags to filer on.
  var currentTags = req.query.tags || false;
  if (currentTags === 'none') {
    currentTags = false;
  }

  // Create rendering options.
  var renderOptions = {
    openBurgerMenu: openBurgerMenu,
    currentView: currentView,
    currentTags: currentTags
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
