'use strict';

var handlebars = require('hbs').handlebars;
var htmlEncode = require('ent/encode');

module.exports = {
  newlinesToBreaks: function(context, options) {
    return new handlebars.SafeString(context.replace(/\n/g, '<br>'));
  },
  docstringToHtml: function(context, options) {
    var content = context.split('\n');
    content = content.reduce(function(previous, current) {
      var safeContent = htmlEncode(current) || '&nbsp;';
      return previous += '<p>' + safeContent + '</p>';
    }, '');
    content = content.replace(/\s/g, '&nbsp;');
    return new handlebars.SafeString(content);
  }
};
