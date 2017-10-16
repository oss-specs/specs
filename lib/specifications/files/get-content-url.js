/**
 * Generate a link for editing a file in a Git repo.
 */
'use strict';

module.exports = function getContentUrl(fileUrl) {
  return fileUrl.replace(/(\/project\/.*?\/file)/, '$1Content');
};
