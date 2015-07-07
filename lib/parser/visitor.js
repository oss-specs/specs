"use strict";
/* eslint camelcase: 0 */

function Visitor() {
    var features = [];
    var scenarios = [];
    var records = [];

    return {
        comment: function(value, line) {
        },
        tag: function(value, line) {
        },
        feature: function(keyword, name, description, line) {
            features.push({token: 'feature', keyword: keyword, name: name, description: description, line: line});
        },
        background: function(keyword, name, description, line) {
        },
        scenario: function(keyword, name, description, line) {
            scenarios.push({token: 'scenario', keyword: keyword, name: name, description: description, line: line});
        },
        scenario_outline: function(keyword, name, description, line) {
        },
        examples: function(keyword, name, description, line) {
        },
        step: function(keyword, name, line) {
        },
        doc_string: function(content_type, string, line) {
        },
        row: function(row, line) {
        },
        eof: function() {
        },
        records: records,
        features: features,
        scenarios: scenarios
    };
}

module.exports = Visitor;

