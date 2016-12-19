// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

// Sequential Gulp tasks
var runSequence = require('run-sequence').use(gulp);

var projectPaths = require('../../package.json').paths;
var path = require('path');

var cucumber = require('gulp-cucumber');

var jasmine = require('gulp-jasmine');
var jasmineReporters = require('jasmine-reporters');

// Parse any command line arguments ignoring
// Node and the name of the calling script.
var argv = require('minimist')(process.argv.slice(2));

// Extract arguments for the Cucumber tasks.
var tags = argv.tags || false;
var reporter = argv.reporter || false;

// Where cucumber json report is stored
var jsonOutputPath = projectPaths['test-output-dir'] + '/cucumber.json';

// Create the reporters for Jasmine.
var terminalReporter = new jasmineReporters.TerminalReporter({
  color: true,
  verbosity: 3
});
var jUnitXmlReporter = new jasmineReporters.JUnitXmlReporter({
  savePath: path.normalize(projectPaths['test-output-dir']),
  filePrefix: 'unitTests',
  consolidateAll: true
});

function createCucumberOptions(tags, reporter) {
  var additionalReporter = reporter || 'summary';
  return {
    support: projectPaths['cucumber-support-js'],
    tags: tags,
    format: ['json:' + jsonOutputPath, 'pretty', additionalReporter]
  };
}

function cucumberXmlReport(opts) {
  var gutil = require('gulp-util'),
    through = require('through2'),
    cucumberJunit = require('cucumber-junit');

  return through.obj(function (file, enc, cb) {
    var xml = cucumberJunit(file.contents, opts);
    file.contents = new Buffer(xml);
    file.path = gutil.replaceExtension(file.path, '.xml');
    cb(null, file);
  });
}

gulp.task('test:cucumber', function () {
  return gulp.src(projectPaths['feature-files'])
    .pipe(cucumber(createCucumberOptions(tags, reporter)))
      .on('end', function () {
        gulp.src(jsonOutputPath)
            .pipe(cucumberXmlReport({ strict: true }))
            .pipe(gulp.dest(projectPaths['test-output-dir']));
      });
}, {
  options: {'tags': 'Supports optional tags argument e.g.\n\t\t\t--tags @parsing\n\t\t\t--tags @tag1,orTag2\n\t\t\t--tags @tag1 --tags @andTag2\n\t\t\t--tags @tag1 --tags ~@andNotTag2'}
});


// The default Cucumber test run requires the server to be running.
gulp.task('test:features', 'Everything necessesary to test the features.', function(done) {
  runSequence('set-envs:test',
  'server:start',
  'test:cucumber',
  function () {
    runSequence('server:stop', done);
  });
}, {
  options: {'tags': 'Supports same optional tags arguments as \'test:cucumber\' task.'}
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
