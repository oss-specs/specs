"use strict";

var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io

/**
 * Get a list of feature files.
 *
 * @return a promise for an array of feature files.
 */
module.exports = function getFeatureFiles(getPath) {
  return fs.listTree(getPath, function guard(path) {
    return /\.feature$/.test(path);
  });
};
