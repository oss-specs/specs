var cucumber = require('cucumber');
var Gherkin = require('gherkin');
var should = require('should');

module.exports = function() {

  var Recorder=function(){
    features = [];
    scenarios = [];
    records = [];
    return {
      comment: function(value, line) {
        records.push({token:'comment',value:value,line:line});
      },
      tag: function(value, line) {
        records.push({token:'tag',value:value,line:line});
      },
      feature: function(keyword, name, description, line) {
        features.push({token:'feature',keyword:keyword,name:name,description:description,line:line});
      },
      background: function(keyword, name, description, line) {
        records.push({token:'background',keyword:keyword,name:name,description:description,line:line});
      },
      scenario: function(keyword, name, description, line) {
        scenarios.push({token:'scenario',keyword:keyword,name:name,description:description,line:line});
      },
      scenario_outline: function(keyword, name, description, line) {
        records.push({token:'scenario_outline',keyword:keyword,name:name,description:description,line:line});
      },
      examples: function(keyword, name, description, line) {
        records.push({token:'examples',keyword:keyword,name:name,description:description,line:line});
      },
      step: function(keyword, name, line) {
        records.push({token:'step',keyword:keyword,name:name,line:line});
      },
      doc_string: function(content_type, string, line) {
        records.push({token:'doc_string',content_type:content_type,string:string,line:line});
      },
      row: function(row, line) {
        records.push({token:'row',row:row,line:line});
      },
      eof: function() {
        records.push({token:'eof'});
      },
      records:records,
      features:features,
      scenarios:scenarios
    };
  };


  var recorder, featureText;

  this.Given(/^following feature file$/, function (string) {
    // Write code here that turns the phrase above into concrete actions
    featureText = string;

  });

  this.When(/^I parse this specification$/, function () {
    //console.log(lexer);
    // Write code here that turns the phrase above into concrete actions

    recorder = new Recorder();
    var Lexer = new Gherkin.Lexer("en");
    var lexer = new Lexer(recorder);
    lexer.scan(featureText);
  });

  this.Then(/^I get a feature with title "([^"]*)"$/, function (featureTitle) {
    // Write code here that turns the phrase above into concrete actions

    recorder.features[0].name.should.be.exactly(featureTitle);
  });

  this.Then(/^scenarios with titles$/, function (table) {
    // Write code here that turns the phrase above into concrete actions

    for(i=0; i<table.raw().length; i++) {
      var row = table.raw()[i];
      var scenario = recorder.scenarios[i];
      scenario.name.should.be.exactly(row[0]);
    }
  });
}