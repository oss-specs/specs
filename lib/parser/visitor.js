"use strict";
/* eslint camelcase: 0 */

function Visitor() {
    var features = [];
    var scenarios = [];
    var records = [];

    return {
        comment: function(value, line) {
            records.push({token: 'comment', value: value, line: line});
        },
        tag: function(value, line) {
            records.push({token: 'tag', value: value, line: line});
        },
        feature: function(keyword, name, description, line) {
            features.push({token: 'feature', keyword: keyword, name: name, description: description, line: line});
        },
        background: function(keyword, name, description, line) {
            records.push({token: 'background', keyword: keyword, name: name, description: description, line: line});
        },
        scenario: function(keyword, name, description, line) {
            scenarios.push({token: 'scenario', keyword: keyword, name: name, description: description, line: line});
        },
        scenario_outline: function(keyword, name, description, line) {
            records.push({token: 'scenario_outline', keyword: keyword, name: name, description: description, line: line});
        },
        examples: function(keyword, name, description, line) {
            records.push({token: 'examples', keyword: keyword, name: name, description: description, line: line});
        },
        step: function(keyword, name, line) {
            records.push({token: 'step', keyword: keyword, name: name, line: line});
        },
        doc_string: function(content_type, string, line) {
            records.push({token: 'doc_string', content_type: content_type, string: string, line: line});
        },
        row: function(row, line) {
            records.push({token: 'row', row: row, line: line});
        },
        eof: function() {
            records.push({token: 'eof'});
        },
        records: records,
        features: features,
        scenarios: scenarios
    };
}

module.exports = Visitor;
