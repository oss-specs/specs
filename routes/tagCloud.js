'use strict';
/* eslint new-cap: 0 */
var cloud = require("d3-cloud");
var canvas = cloud.canvas;

var path = require('path');
var url = require('url');

var express = require('express');
var router = express.Router();

var markdown = require('markdown').markdown;
var getProjectData = require('../lib/specifications/project').getData;
var getFileContents = require('../lib/specifications/project').getFileContents;
var appConfig = require('../lib/configuration').get();

var Gherkin = require('gherkin');
var Parser = new Gherkin.Parser();


var handlebars = require('hbs').handlebars;

var Gherkin = require('gherkin');
var Parser = new Gherkin.Parser();
var markdown = require('markdown').markdown;

var arrrayToTree = require('file-tree');
var TreeModel = require('tree-model');

var getProject = require('../lib/specifications/project').get;
var getProjectData = require('../lib/specifications/project').getData;
var getFileContents = require('../lib/specifications/project').getFileContents;

var countTags = require('../lib/specifications/tags').count;

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
    var pathToData = getFilePathToFileData(appConfig, projectData, getFileContents);

    // Map list of file paths to list of file data objects.
    projectData.files = projectData.files.map(pathToData);

    // Wait for content promises to resolve then mix
    // in the resolved file content.
    var promisesForFileContent = projectData.files.map(function(f) {return f.contentsPromise;});
    return Promise.all(promisesForFileContent)
      .then(function(fileContents) {
        var tagNames = [];

        // Mix in the file content.
        projectData.files = projectData.files.map(getProcessFileContent(fileContents));


        // If the project config contains a URL format
        // for creating links to edit files then grab it.
        if (projectData.config.editUrlFormat) {
          projectData.files.forEach(function(file) {
            var editUrlTemplate = handlebars.compile(projectData.config.editUrlFormat);
            var editUrl = editUrlTemplate({
              repoUrl: projectData.repoUrl,
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

        console.log("$$$$$$")
        projectData.tagCloud = Object.keys(projectTags).map(function (key) {
            console.log(key);
          return {
            text: key,
            size: projectTags[key].count
          }
        });
        projectData.tags = projectTags;

        console.log("Tag cloud:", projectData.tagCloud);
        projectData.tagCloudJsonString = JSON.stringify(projectData.tagCloud);
        console.log("Tag cloud string: ", projectData.tagCloudJsonString);

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


          //
          //
          //
          // cloud().size([960, 500])
          //     .canvas(function() { return new canvas(1, 1); })
          //     .words(renderingData.tagCloud)
          //     .padding(5)
          //     .rotate(function() { return ~~(Math.random() * 2) * 90; })
          //     .font("Impact")
          //     .fontSize(function(d) { return d.size; })
          //     .on("end", end)
          //     .start();
          //
          // function end(words) { console.log(JSON.stringify(words)); }

          // Render the page.
          res.render('tag-cloud', renderingData);
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













/**
 * Given a feature data structure and a scenario id mark a particular scenario as requested.
 * @param  Object feature              Feature data structure.
 * @param  String targetedScenarioId   The id of the targeted scenario (URI encoded scenario name)
 * @return Object                      Modified feature data structure.
 */
function markTargetedFeature(feature, targetedScenarioName) {
  var scenarios = feature.scenarioDefinitions;
  scenarios.forEach(function(scenario) {
    if (scenario.name === targetedScenarioName) {
      scenario.requested = true;
      scenario.defaultOpen = true;
    }
  });

  return feature;
}


// Display an individual feature in a project.
// htpp://host/<project name>/<root/to/file>
router.get(/([^\/]+)\/tagcloud/, function (req, res, next) {
  console.log('WTF');
  var projectName = req.params[0];
  var ref = req.query.ref;

  var projectData = {
    name: projectName,
    localPath: path.join(appConfig.projectsPath, projectName),
    currentBranchName: ref
  };

    // Session variable.
    if(!req.session.branches) req.session.branches = {};
    var sessionBranches = req.session.branches;

    // The repository name from the URL.
    var repoName = req.params[0];

    // Query param indicating a particular ref should
    // be used when retrieving repo data.
    var targetBranchName = req.query.branch || false;

    // Create rendering options.
    var renderOptions = {}

    // Create the render and passError functions.
    var configuredRender = getRender(res, appConfig, renderOptions);
    var configuredPassError = getPassError(next);

    // TODO: Have one place this object is created.
    var projectData = {
      repoName: repoName,
      projectLink: path.posix.join(appConfig.projectRoute, repoName),
      localPath: path.join(appConfig.projectsPath, repoName)
    };

    console.log(projectData);

      // Update the repo and get the repo data.
      getProject(projectData)
        .then(configuredRender)
        .catch(configuredPassError);

});

module.exports = router;
