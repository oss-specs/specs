'use strict';

var path = require('path');

var express = require('express');
var router = express.Router();

var arrrayToTree = require('file-tree');
var TreeModel = require('tree-model');

var processFiles = require('../lib/specifications/files/process-files');

var filterFeaturesAndScenarios = require('../lib/specifications/files/feature-files/tags').filterFeaturesAndScenarios;
var getEditUrl = require('../lib/specifications/files/get-edit-url');

var getProject = require('../lib/specifications/projects/project').get;
var getProjectData = require('../lib/specifications/projects/project').getData;
var getFileContent = require('../lib/specifications/projects/project').getFileContent;

var applyProjectView = require('../lib/specifications/projects/project-views').applyProjectView;
var modifyProjectView = require('../lib/specifications/projects/project-views').modifyProjectView;

var appConfig = require('../lib/configuration/app-config').get();


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
  var currentProjectViewName = req.query.view || false;

  // Query parameter containing desired feature tags to filter on.
  var currentTags = req.query.tags || false;
  if (currentTags === 'none') {
    currentTags = false;
  }

  // Create rendering options.
  var renderOptions = {
    openBurgerMenu: openBurgerMenu,
    currentProjectViewName: currentProjectViewName,
    currentTags: currentTags
  };

  // Create the render and passError functions.
  var configuredRender = getRender(res, appConfig, renderOptions);
  var configuredPassError = getPassError(next);

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


/**
 * Render the project page and send to client.
 *
 * Modification to the project data happens within this function
 * e.g. filtering files by tag and organising files by directory.
 *
 * @param  {Function} res         The Express Response object.
 * @param  {Object} appConfig     The application configuration object.
 * @param  {Object} renderOptions Rendiering options passed from the route.
 * @return {Function}             The render function used in the route.
 */
function getRender(res, appConfig, renderOptions) {
  return function render(projectData) {
    var renderingData = {};

    // The tags object associated with this project.
    var projectTags = {};

    renderingData.openBurgerMenu = renderOptions.openBurgerMenu;
    renderingData.currentProjectViewName = renderOptions.currentProjectViewName;
    renderingData.tagRequested = !!renderOptions.currentTags;

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
    let ret = applyProjectView(projectData, renderingData);
    projectData = ret[0];
    renderingData = ret[1];

    // Modify the project view based on other information
    // such as whether the files are being filtered by tag.
    // This only affects rendering flags, it doesn't
    // modify project data.
    renderingData = modifyProjectView(renderingData);

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

        // Filter the features and scenarios by requested tag name.
        let ret = filterFeaturesAndScenarios(projectData, projectTags, renderOptions.currentTags);
        projectData = ret[0];
        projectTags = ret[1];

        // Extract general stats about the files, dependent on file types.
        renderingData.fileStats = processFiles.generateFileStats(projectData.files);

        // Generate a file tree and use it to do the final render.
        var fileList = projectData.files.map(function(file) { return file.filePath; });
        var generateLeaf = getGenerateLeaf(renderingData);
        var postTreeRenderCallback = getPostTreeCallback(renderingData, getRenderCallback(res));
        arrrayToTree(fileList, generateLeaf, postTreeRenderCallback);
      });
  };
}


/**
 * Render the page.
 * @param  {Express Response} res The Express Route Response object.
 * @return {Function}             The rendering callback.
 */
function getRenderCallback(res) {
  return function renderCallback(renderingData) {
    res.render('project', renderingData);
  };
}


/**
 * After the tree is built record the files organised by dir then render.
 * @param  {Object} renderingData     The rendering data including the project data.
 * @param  {Function} renderCallback  The passed rendering callback, see `getRenderCallback`.
 * @return {Function}                 Group files by dir then render.
 */
function getPostTreeCallback(renderingData, renderCallback) {
  return function postTreeCallback(err, fileTree) {
    var projectData = renderingData.project;

    // Generate and reference the file grouped by directory.
    projectData.filesByDir = groupFilesByDirectory(fileTree);

    renderCallback(renderingData);
  };
}


/**
 * A callback for file-tree module (arrrayToTree).
 *
 * Given a file path generate a leaf node and
 * call next when done.
 *
 * @param  {Object} renderingData The rendering data object.
 * @return {Function}             Generate the leaf.
 */
function getGenerateLeaf(renderingData) {
  return function generateLeaf(filePath, next) {
    var projectData = renderingData.project;

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
  };
}


/**
 * Use the tree to construct sets of files grouped by parent directory.
 * @param  {Object} fileTree The tree like object generated by the file-tree module.
 * @return {Object}          The file objects organised by parent directory.
 */
function groupFilesByDirectory(fileTree) {
  var filesByDir = {};

  // Convert the fileTree to a real tree with helper methods.
  var treeRoot = (new TreeModel()).parse({name: 'root', children: fileTree});

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

  return filesByDir;
}


/**
 * Conditionally add edit link data to file objects.
 * @param {Object} projectData  The project data.
 * @return {Object}             The modified project data.
 */
function addEditLinks(projectData) {
  if (projectData.config.editUrlFormat) {
    projectData.files.forEach(function(file) {
      file.editUrl = getEditUrl(projectData, file.filePath);
    });
  }
  return projectData;
}

/**
 * Pass errors to the next Express middleware for handling.
 * @param  {Function} next Express Router Next function.
 * @return {Function}      Call next with the passed error.
 */
function getPassError(next) {
  return function passError(err) {
    next(err);
  };
}

module.exports = router;
