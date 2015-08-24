'use strict';
/* eslint camelcase: 0 */

function Step(config) {
  this.token = 'step';
  this.keyword = config.keyword;
  this.name = config.name;
  this.line = config.line;

  // Split on arguments and placeholders.
  var contentArray = this.name.split(/(".+?"|<.+?>)/);

  // Map to annotated list for better highlighting options.
  // Note that we could use quotes to detect arguments
  //in steps, but arguments don't have to be surrounded
  // by quotes, they are dynamically defined by the
  // step definition regex.
  contentArray = contentArray.map(function(value) {
    var returnObject = {};
    var contentType = 'plain';

    // N.b. placholders are only valid in Scenario Outlines
    // , so this will incorrectly identify placeholders
    // in scenarios.
    if (value[0] === '<') contentType = 'placeholder';

    returnObject[contentType] = value;
    return returnObject;
  });

  this.content = contentArray;
}

module.exports = function(config) {
  return new Step(config);
}
