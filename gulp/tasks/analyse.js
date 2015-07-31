// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

var eslint = require('gulp-eslint');

var path = require('path');

var projectPaths = require('../../package.json')['paths'];

var fs = require('fs');
var lintingOutputPath = path.join(projectPaths['test-output-dir'], 'lintingResults.xml');

var eslintGlobs = [].concat(projectPaths['server-js'], projectPaths['client-js']);
var eslintOptions = {
  'useEslintrc': true
};

gulp.task('analyse:lint', 'Lint the server and client JavaScript files.', function() {
  var lintResultsFileStream = fs.createWriteStream(lintingOutputPath);
  return gulp.src(eslintGlobs)
    .pipe(eslint(eslintOptions))
    .pipe(eslint.format())
    .pipe(eslint.format('junit', lintResultsFileStream));
});
