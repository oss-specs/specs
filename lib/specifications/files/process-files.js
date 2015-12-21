/**
 * Functions for processing files.
 */
'use strict';

var path = require('path');

var Gherkin = require('gherkin');
var featureParser = new Gherkin.Parser();
var markdown = require('markdown').markdown;

var countScenarios = require('./feature-files/count-scenarios');


module.exports = {
  getFilePathToFileObject: getFilePathToFileObject,
  generateFileStats: generateFileStats,
  processFileContent: processFileContent
};


/**
 * Create a function that takes a file path and returns an object representing a file.
 * @param  String projectRoute      The URL fragment representing the project route root.
 * @param  Object projectData       Data about the current project.
 * @param  Function getFileContent  Function for getting file content.
 * @return Function                 The function which will convert the file path to a file object.
 */
function getFilePathToFileObject(projectRoute, projectData, getFileContent) {

  /**
   * Given a file path return an object represenating that file
   * potentially including a promise for the file contents.
   * @param  String filePath The file path.
   * @return Object file     The object representing the file at filePath.
   */
  return function filePathToFileObject(filePath) {
    var file = {};

    file.name = path.basename(filePath);
    file.filePath = filePath;

    file.route = path.posix.join(projectRoute, projectData.repoName, 'file', filePath);

    file.isFeatureFile = /.*\.feature$/.test(filePath);
    file.isMarkdownFile = /.*\.md$/.test(filePath);

    if (file.isFeatureFile || file.isMarkdownFile) {
      file.contentPromise = getFileContent(projectData, filePath);
    } else {
      file.contentPromise = undefined;
    }

    // Asynchronously copy the data once it is available.
    // Functions wanting to use this data will have to
    // make sure all the promises have been resolved
    // or rejected.
    if (file.contentPromise) {
      file.contentPromise.then(function(content) {
        file.content = content;
      }, function(err) {
        throw err;
      });
    }

    return file;
  };
}

function generateFileStats(files) {
  var stats = {
    features: {
      numFeatures: 0,
      numScenarios: 0
    }
  };

  if (typeof file === 'string') {
    throw new TypeError('Please process files into data structures before trying to extract statistics.');
  }

  files.forEach(function (file) {
    if (file.isFeatureFile && file.data) {
      stats.features.numFeatures += 1;
      stats.features.numScenarios += countScenarios(file.data);
    }
  });

  return stats;
}

/**
 * Decorate a file object with a data structure of its parsed contents.
 * @param  Object file    Object representing a file.
 * @return Object         The decorated file object.
 */
function processFileContent(file) {
  var fileContent = file.content;

  if (!fileContent || !fileContent.length) {
    file.empty = true;
  }

  try {
    if (file.isFeatureFile) {
      file.data = featureParser.parse(fileContent);
    } else if(file.isMarkdownFile) {
      file.data = markdown.parse(fileContent);
      file.html = markdown.renderJsonML(markdown.toHTMLTree(fileContent));
    } else {
      file.data = false;
    }
  } catch (err) {
    file.data = false;
    file.error = err;
  }

  return file;
}
