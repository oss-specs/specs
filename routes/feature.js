'use strict';
/* eslint new-cap: 0 */

var url = require('url');

var express = require('express');
var router = express.Router();

var getProjectData = require('../lib/specifications/projects/project').getData;
var getFileContent = require('../lib/specifications/projects/project').getFileContent;

var processFiles = require('../lib/specifications/files/process-files');
var getEditUrl = require('../lib/specifications/files/get-edit-url');

var appConfig = require('../lib/configuration/app-config').get();


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
// htpp://host/<project name>/file/<root/to/file>
router.get(/([^\/]+)\/file\/([\w\W]+)/, function (req, res, next) {
  var repoName = req.params[0];
  var filePath = req.params[1];
  var ref = req.query.ref;

  var projectData = {
    repoName: repoName,
    localPathRoot: appConfig.projectsPath,
    currentBranchName: ref
  };

  // Skip the rendering for query param ?plain=true ?plain=1 etc.
  var renderPlainFile = req.query.plain === 'true' || !!parseInt(req.query.plain);

  // Optional name of a particular scenario.
  var targetedScenarioName = req.query.scenario || false;

  // An object referring to the file we want to render.
  var file;

  getProjectData(projectData, ref)
  .then(function (_projectData) {
    projectData = _projectData;

    var filePathToFileObject = processFiles.getFilePathToFileObject(appConfig.projectRoute, projectData, getFileContent);
    return filePathToFileObject(filePath);
  })
  .then(function(_file) {
    file = _file;
    return file.contentPromise;
  })
  .then(function () {
    var originalUrl;

    // Parse the file content.
    file = processFiles.processFileContent(file);

    // If there was a parsing error provide a link to the plain text file
    // so that it can be linked to in the UI to help with issue analysis.
    if (file.error) {
      originalUrl = url.parse(req.originalUrl);
      originalUrl.search = originalUrl.search.length ? originalUrl.search + '&plain=true' : '?plain=true';
      file.plainFileUrl = url.format(originalUrl);
    }

    // Add an edit link to the file.
    file.editUrl = getEditUrl(projectData, file.filePath);

    if (file.isFeatureFile && !renderPlainFile) {

      // Determine if a particular scenario was targeted and mark
      // it so that it can be rendered accordingly.
      if (targetedScenarioName) {
        file.data = markTargetedFeature(file.data, targetedScenarioName);
      }

      res.render('feature', {file: file});

    } else if (file.isMarkdownFile && !renderPlainFile) {
      res.render('markdown-file', {file: file});

    } else {
      res.render('general-file', {file: file});
    }
  })
  .catch(function (err) {
    // Pass on to the error handling route.
    if (!err.status && err.code === 'ENOENT') {
      err.status = 404;
    }
    next(err);
  });
});

module.exports = router;
