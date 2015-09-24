"use strict";

var getGitFilePaths = require('./projectGitInteractions').getFilePaths;

/**
 * Get a list of feature files.
 *
 * @return a promise for an array of feature file paths.
 */
module.exports = function getFeatureFilePaths(projectData) {
  return getGitFilePaths(projectData).then(function(paths) {
    return paths.filter(function(path) {
      return /\.(feature|md)$/.test(path);
    })
  });
};
