'use strict';

var express = require('express');
var router = express.Router();

var processFiles = require('../lib/specifications/files/process-files');

var getProjectData = require('../lib/specifications/projects/project').getData;
var getFileContent = require('../lib/specifications/projects/project').getFileContent;

var countProjectTags = require('../lib/specifications/files/feature-files/tags').countProjectTags;

var appConfig = require('../lib/configuration/app-config').get();


// List of available features in a project.
router.get(/^\/([^\/]+)\/(tagcloud|taglist)$/, function(req, res, next) {

  // tagcloud or taglist.
  var tagVisualisationType = req.params[1];

  // Session variable.
  if(!req.session.branches) {
    req.session.branches = {};
  }
  var sessionBranches = req.session.branches;

  // The repository name from the URL.
  var repoName = req.params[0];

  var renderingOptions = {
    tagVisualisationType: tagVisualisationType,
    projectUrl: req.originalUrl.replace(/\/[^\/]*$/,'')
  };

  // Create the render and passError functions.
  var configuredRender = getRender(res, appConfig, renderingOptions);
  var configuredPassError = getPassError(next);

  var projectData = {
    repoName: repoName,
    localPathRoot: appConfig.projectsPath
  };

  getProjectData(projectData, sessionBranches[repoName])
    .then(configuredRender)
    .catch(configuredPassError);
});


/**
 * Render the project page and send to client.
 *
 * Modification to the project data happens within this function
 * e.g. filtering files by tag and organising files by directory.
 *
 * @param  {Function} res         The Express Response object.
 * @param  {Object} appConfig     The application configuration object.
 * @return {Function}             The render function used in the route.
 */
function getRender(res, appConfig, renderingOptions) {
  return function render(projectData) {
    var renderingData = {};

    var tagVisualisationType = renderingOptions.tagVisualisationType;
    renderingData.projectUrl = renderingOptions.projectUrl;

    // Create a reference to the project data on
    // the object that will be passed to the
    // template.
    renderingData.project = projectData;

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

        // Count the tags.
        let ret = countProjectTags(projectData);
        projectData = ret[0];

        renderingData.numTags = Object.keys(projectData.tags).length;
        renderingData.sortedTags = Object.keys(projectData.tags)
                                      .map(t => ({
                                        tag: t,
                                        count: projectData.tags[t].count,
                                        urlEncodedName: projectData.tags[t].urlEncodedName
                                      }))
                                      .sort((a, b) => b.count - a.count);
        renderingData.tagJson = JSON.stringify(renderingData.sortedTags);

        // Use the tagcloud or taglist template.
        res.render(tagVisualisationType, renderingData);
      });
  };
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
