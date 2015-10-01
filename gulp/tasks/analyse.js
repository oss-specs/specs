// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

var eslint = require('gulp-eslint');

var path = require('path');

var projectPaths = require('../../package.json')['paths'];

var fs = require('fs');
var lintingOutputPath = path.join(projectPaths['test-output-dir'], 'lintingResults.xml');

gulp.task('lint', 'Lint JavaScript and write to standard out and file.', function() {
  var lintResultsFileStream = fs.createWriteStream(lintingOutputPath);
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.format('junit', lintResultsFileStream));
});
