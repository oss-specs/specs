'use strict';

var handlebars = require('hbs').handlebars;

module.exports = {
  newlinesToBreaks: function(context, options) {
    return new handlebars.SafeString(context.replace(/\n/g, '<br>'));
  }
};
