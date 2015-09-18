"use strict";

var Gherkin = require('gherkin');
var Parser = new Gherkin.Parser();

module.exports = function GherkinParser() {
  var features;

  return {
    lexed: false,
    parse: function(text) {
      features = Parser.parse(text);
      this.lexed = true;

      // Allow chaining.
      return this;
    },
    getFeatures: function() {
      if (!this.lexed) throw new Error('Can not get features before a feature string has been parsed.');
      return features;
    }
  };
};
