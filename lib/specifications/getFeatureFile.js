"use strict";

var fs = require("q-io/fs"); // https://github.com/kriskowal/q-io

/**
 * Get teh contents of a feature file.
 *
 * @return a promise for the file contents.
 */
module.exports = function getFeatureFile(filePath) {

  // TODO: move base directory to config.
  filePath = __dirname + "/../../public/feature-files/" + filePath + ".feature";

  return fs.read(filePath);
};
