/**
 * * Interact with Jenkins to get results in a generic format.
 */

'use strict';

var getResults = require('./results').getCiResults;

module.exports = {
  getCiResults: getResults
};