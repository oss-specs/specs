"use strict";
/* eslint new-cap: 0 */

require('should');

var GherkinParser = require('../../lib/parser/gherkin.js');

module.exports = function() {
  // Shared variables
  var featureText;
  var parser;
  var visitor;

  this.Given(/^following feature file$/, function (string) {
    // Write code here that turns the phrase above into concrete actions
    featureText = string;
  });

  this.When(/^I parse this specification$/, function () {
    //console.log(lexer);
    // Write code here that turns the phrase above into concrete actions

    parser = new GherkinParser();
    visitor = parser.parse(featureText);
  });

  this.Then(/^I get a feature with title "([^"]*)"$/, function (featureTitle) {
    // Write code here that turns the phrase above into concrete actions

    visitor.features[0].name.should.be.exactly(featureTitle);
  });

  this.Then(/^scenarios with titles$/, function (table) {
    // Write code here that turns the phrase above into concrete actions

    for(var i = 0; i < table.raw().length; i++) {
      var row = table.raw()[i];
      var scenario = visitor.scenarios[i];
      scenario.name.should.be.exactly(row[0]);
    }
  });
};
