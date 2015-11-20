/**
 * Get file contents.
 */
'use strict';

// Currently hard coded to get file contents from a Git repo.
var getFileContentsGit = require('../repository-types/git').getFileContents;

module.exports = getFileContentsGit;
