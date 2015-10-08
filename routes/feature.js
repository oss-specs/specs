'use strict';
/* eslint new-cap: 0 */

var path = require('path');

var express = require('express');
var router = express.Router();

var markdown = require('markdown').markdown;
var getProjectData = require('../lib/specifications/project').getData;
var getFileContents = require('../lib/specifications/project').getFileContents;
var appConfig = require('../lib/configuration').get();

var Gherkin = require('gherkin');
var Parser = new Gherkin.Parser();


// Display an individual feature in a project.
// htpp://host/<project name>/<root/to/file>
router.get(/([^\/]+)\/([\w\W]+)/, function (req, res, next) {
  var projectName = req.params[0];
  var filePath = req.params[1];
  var ref = req.query.ref;

  var projectData = {
    name: projectName,
    localPath: path.join(appConfig.projectsPath, projectName),
    currentBranchName: ref
  };

  // Skip the rendering for query param ?plain=true ?plain=1 etc.
  var renderPlainFile = req.query.plain === 'true' || !!parseInt(req.query.plain);

  getProjectData(projectData, ref)
  .then(function (projectData) {
    return getFileContents(projectData, filePath);
  })
  .then(function (fileContents) {
    var feature;
    var isFeatureFile = /.*\.feature/.test(filePath);
    var isMarkdownFile = /.*\.md/.test(filePath);

    if (isFeatureFile && !renderPlainFile) {

      try {
        feature = Parser.parse(fileContents);
      } catch (err) {
        feature.error = err;
      }

      res.render('feature', {feature: feature});
    } else if (isMarkdownFile && !renderPlainFile) {
      res.render('markdown-file', {markdownHtml: markdown.toHTML(fileContents)});
    } else {
      res.render('general-file', {contents: fileContents});
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
