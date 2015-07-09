"use strict";

var git = require("nodegit");
var path = require("path");

/**
 * Get a copy of the project using Git.
 *
 * @return a promise for the completion of the operation.
 */
module.exports = function getProject(repoUrl, repoName) {

  // TODO get rid of magic knowledge of 'public/feature-files'.
  var localName = path.join(__dirname, "../../public/feature-files", repoName);

  // Mac OSX issue http://www.nodegit.org/guides/cloning/
  var cloneOptions = {};
  cloneOptions.remoteCallbacks = {
    certificateCheck: function() { return 1; }
  };

  return git.Clone(repoUrl, localName, cloneOptions);
};
