/**
 * Functions for processing files.
 */
'use strict';

var path = require('path');

var Gherkin = require('gherkin');
var Parser = new Gherkin.Parser();
var markdown = require('markdown').markdown;

// Currently hard coded to get file contents from a Git repo.
var getFileContentGit = require('../repository-types/git').getFileContent;
var getFileContent = getFileContentGit;


module.exports = {
  getFileContent: getFileContent,
  getFilePathToFileData: getFilePathToFileData,
  processFileContent: processFileContent
};


/**
 * Create a function that takes a file path and returns an object representing a file.
 * @param  String projectRoute      The URL fragment representing the project route root.
 * @param  Object projectData       Data about the current project.
 * @return Function                 The function which will convert the file path to a file object.
 */
function getFilePathToFileData(projectRoute, projectData) {

  /**
   * Given a file path return an object represenating that file
   * potentially including a promise for the file contents.
   * @param  String filePath The file path.
   * @return Object file     The object representing the file at filePath.
   */
  return function filePathToFileData(filePath) {
    var file = {};

    file.name = path.basename(filePath);
    file.filePath = filePath;

    file.route = path.posix.join(projectRoute, projectData.repoName, filePath);

    file.isFeatureFile = /.*\.feature/.test(filePath);
    file.isMarkdownFile = /.*\.md/.test(filePath);

    if (file.isFeatureFile || file.isMarkdownFile) {
      file.contentPromise = getFileContent(projectData, filePath);
    } else {
      file.contentPromise = undefined;
    }

    // Asynchronously copy the data once it is available.
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
