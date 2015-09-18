"use strict";

var path = require('path');

var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io

// TODO: move to dependency injection.
var appConfig = require('../configuration').get();

/**
 * Get the contents of a feature file from disk.
 *
 * @return a promise for the file contents.
 */
module.exports = function getFeatureFile(filePath) {

  // If the filename doesn't end in .feature or .md add feature.
  // This is purely to enable URLs without file extensions.
  if (!/\.(feature|md)$/.test(filePath)) filePath += ".feature";

  filePath = path.join(appConfig.projectsPath, filePath);

  return fs.read(filePath);
};
