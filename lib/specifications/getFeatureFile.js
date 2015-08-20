"use strict";

var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io

/**
 * Get the contents of a feature file from disk.
 *
 * @return a promise for the file contents.
 */
module.exports = function getFeatureFile(filePath) {

  // If the filename doesn't end in .feature or .md add feature.
  // This is purely to enable URLs without .feature on the end.
  if (!/\.(feature|md)$/.test(filePath)) filePath += ".feature";

  // TODO: move base directory to config.
  filePath = __dirname + "/../../public/feature-files/" + filePath;

  return fs.read(filePath);
};
