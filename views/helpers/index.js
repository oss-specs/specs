'use strict';

var handlebars = require('hbs').handlebars;
var htmlEncode = require('ent/encode');

function getStringConverter(aggregator) {
  return function(context, options) {
    var content = context.split('\n');
    content = content.reduce(function(previous, current) {

      // Gaurantee rendered content.
      var safeContent = htmlEncode(current) || '&nbsp;';
      return previous += aggregator(safeContent);
    }, '');

    // Render leading whitespace characters.
    content = content.replace(/\s/g, '&nbsp;');
    return new handlebars.SafeString(content);
  }
}

module.exports = {
  newlinesToBreaks: getStringConverter(function(safeContent) { return safeContent + '<br>'; }),
  docstringToHtml: getStringConverter(function(safeContent) { return '<p>' + safeContent + '</p>'; })
};
