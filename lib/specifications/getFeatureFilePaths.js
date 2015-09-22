"use strict";

var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io
var getGitFilePaths = require('./projectGitInteractions').getFilePaths;

/**
 * Get a list of feature files.
 *
 * @return a promise for an array of feature file paths.
 */
module.exports = function getFeatureFilePaths(projectData) {
  return getGitFilePaths(projectData).then(function(paths) {
    console.log(paths);
    return paths.filter(function(path) {
      return /\.(feature|md)$/.test(path);
    })
  });
};
