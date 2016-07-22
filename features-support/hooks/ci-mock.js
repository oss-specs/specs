/**
 * Set up Mock CI server for UI tests.
 */
'use strict';

var express = require('express');
var app = express();
var server;

app.get('/api/json*', function(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send('{ "jobs": [{"name":"job" }]}');
});

app.get('/job/job/lastCompletedBuild/testReport/api/json*', function (req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send('{ "suites": [{"cases": [{"className":"Features can be retrieved from a remote Git repositories", "name": "Features can be retrieved from a remote Git repo.", "status":"PASSED" }]}]}');
});

module.exports = function seleniumHooks() {
  this.Before('@ci-mock', function(scenario, callback) {
    server =app.listen(5001, function () {
      callback();
    });
  });

  // Tidy up.
  this.After('@ci-mock', function(scenario, callback) {
    server.close();
    callback();
  });
};
