/**
 * Functionality related the treatment of Git repositories as 'projects' with specifications.
 */
'use strict';

var fs = require('q-io/fs'); // https://github.com/kriskowal/q-io

var getNameAndPath = require('./name-and-path').getNameAndPath;

var clone = require('./fetching').clone;
var update = require('./fetching').update;


module.exports = {
  getProject: getProject
};


/**
 * Get or update the project repo using Git.
 *
 * @return a promise for the repo metadata.
 */
function getProject(projectData) {

  // Determine the project name and local path.
  projectData = getNameAndPath(projectData);

  return fs.exists(projectData.localPath)
    .then(function (pathExists) {


      /**
       * If there is no matching directory then clone the repo
       * else perform a pull on it.
       */
      if (!pathExists) {
        return clone(projectData);
      } else {
        return update(projectData);
      }
    });
}
