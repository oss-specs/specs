"use strict";

var Gherkin = require('gherkin');
var Visitor = require('./visitor');

module.exports = function GherkinParser() {
    return {
        parse: function(text) {
            var visitor = new Visitor();
            var Lexer = new Gherkin.Lexer("en");
            var lexer = new Lexer(visitor);
            lexer.scan(text);
            return visitor;
        }
    };
};
