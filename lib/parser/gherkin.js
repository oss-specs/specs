"use strict";

var Gherkin = require('gherkin');
var Visitor = require('./visitor');

var Lexer = new Gherkin.Lexer("en");


module.exports = function GherkinParser() {
  var visitor = new Visitor();
  var lexer = new Lexer(visitor);

  return {
    lexed: false,
    parse: function(text) {
      lexer.scan(text);
      this.lexed = true;
      return this;
    },
    getFeatures: function() {
      if (!this.lexed) throw new Error('Can not get features before a feature string has been parsed.');
      return visitor.getFeatures();
    }
  };
};
