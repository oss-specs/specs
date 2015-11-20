/**
 * Functions for processing files.
 */
'use strict';

var path = require('path');


module.exports = {
  getFilePathToFileData: getFilePathToFileData
};


/**
 * Create a function that takes a file path and returns an object representing a file.
 * @param  String projectRoute      The URL fragment representing the project route root.
 * @param  Object projectData       Data about the current project.
 * @param  Function getFileContents A function for retrieving a promise for the file contents.
 * @return Function                 The function which will convert the file path to a file object.
 */
function getFilePathToFileData(projectRoute, projectData, getFileContents) {

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
      file.contentsPromise = getFileContents(projectData, filePath);
    } else {
      file.contentsPromise = undefined;
    }

    return file;
  };
}


/**
 * Create a function that finds a file in a list of files,
 * parses its contents and decorates the file object with
 * the parsed data structure.
 * @param  Array fileContents    A list of string representations of contents of various files.
 * @return Function              A function taking a file object and decorating it.
 */
function getProcessFileContent(fileContents) {

  /**
   * Decorate a file object with a data structure of its parsed contents.
   * @param  Object file    Object representing a file.
   * @param  Number index   The index of the current file object in the Array fileContents
   * @return Object         The decorated file object.
   */
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
