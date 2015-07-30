'use strict';
/* eslint camelcase: 0 */

module.exports = function(keyword, name, description, line) {
  return {
    token: 'feature',
    keyword: keyword,
    name: name,
    description: description,
    line: line,
    scenarios: []
  };
}
