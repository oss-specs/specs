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
  contentArray = contentArray.map(function(value) {
    var returnObject = {};
    var contentType = 'plain';
    if (value[0] === '"') contentType = 'argument';
    if (value[0] === '<') contentType = 'placeholder';
    returnObject[contentType] = value;
    return returnObject;
  });

  this.content = contentArray;
}

module.exports = function(config) {
  return new Step(config);
}
