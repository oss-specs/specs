// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

// Sequential Gulp tasks
var runSequence = require('run-sequence').use(gulp);

var projectPaths = require('../package.json')['paths'];
var path = require('path');

var cucumber = require('gulp-cucumber');
var jasmine = require('gulp-jasmine');
var jasmineReporters = require('jasmine-reporters');

// Parse any command line arguments ignoring
// Node and the name of the calling script.
var argv = require('minimist')(process.argv.slice(2));

// Extract tags arguments for the Cucumber tasks.
var tags = argv.tags || false;

// Create the reporters for Jamsine.
var terminalReporter = new jasmineReporters.TerminalReporter({
  color: true,
  verbosity: 3
});
var jUnitXmlReporter = new jasmineReporters.JUnitXmlReporter({
  savePath: path.normalize(projectPaths['test-output-dir']),
  filePrefix: 'unitTests',
  consolidateAll: true
});

// Run all the Cucumber features, doesn't start server
// Hidden from gulp-help.
gulp.task('cucumber', 'Run Cucumber directly without starting the server.', function() {
  var options = {
    support: projectPaths['cucumber-support-js'],
    // Tags are optional, falsey values are ignored.
    tags: tags
  }

  // TODO: does this generate test results on disk?
  return gulp.src('features/**/*.feature').pipe(cucumber(options));
}, {
  options: {'tags': 'Supports optional tags argument e.g.\n\t\t\t--tags @parsing\n\t\t\t--tags @tag1,orTag2\n\t\t\t--tags @tag1 --tags @andTag2\n\t\t\t--tags @tag1 --tags ~@andNotTag2'}
});

// The default Cucumber test run requires server to be running.
gulp.task('test:features', 'Test the features.', function(done) {
  runSequence('set-envs:test',
              'server:start',
              'cucumber',
              'server:stop',
              done);
}, {
  options: {'tags': 'Supports same optional tags arguments as \'Cucumber\' task.'}
});

// Run the unit tests, report to terminal and disk.
gulp.task('test:unit', 'Run the unit tests.', function () {
    return gulp.src(projectPaths['unit-test-js'])
        .pipe(jasmine({
          reporter: [
            terminalReporter,
            jUnitXmlReporter
          ]
        }));
});
