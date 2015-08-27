'use strict';

var handlebars = require('hbs').handlebars;
var htmlEncode = require('ent/encode');

// http://www.2ality.com/2014/01/efficient-string-repeat.html
function stringRepeat(str, num) {
  num = Number(num);
  var result = '';
  while (true) {
    if (num & 1) {
      result += str;
    }
    num >>>= 1;
    if (num <= 0) break;
    str += str;
  }
  return result;
}

// Render leading whitespace characters.
function encodeLeadingWhitespace(content) {
  return content.replace(/^\s+/, function(match, offset, string) {
    var nbsp = '<span class="leadingWhitespace">&nbsp;</span>';
    return stringRepeat(nbsp, match.length);
  });
}

function getStringConverter(aggregator) {
  return function(context, options) {
    var content = context.split('\n');
    content = content.reduce(function(previous, current) {

      // Gaurantee rendered content.
      var safeContent = htmlEncode(current) || '&nbsp;';
      return previous += aggregator(encodeLeadingWhitespace(safeContent));
    }, '');
    return new handlebars.SafeString(content);
  }
}

module.exports = {
  newlinesToBreaks: getStringConverter(function(safeContent) {
    return safeContent + '<br>';
  }),
  newlinesToParagraphs: getStringConverter(function(safeContent) {
    return '<p>' + safeContent + '</p>';
  })
};
