"use strict";

var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io

/**
 * Get a list of feature files.
 *
 * @return a promise for an array of feature file paths.
 */
module.exports = function getFeatureFilePaths(containingPath) {
  return fs.listTree(containingPath, function guard(path) {
    return /\.(feature|md)$/.test(path);
  });
};
