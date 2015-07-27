// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

var packagejson = require('../package.json');
var binaryPath = packagejson.bin['module-name'];
var watchGlobs = [
  binaryPath,
  'app.js',
  'lib/**/*.js',
  'public/css/**/*.css',
  'public/javascript/**/*.js',
  'routes/**/*.js',
  'views/**/*'
];

gulp.task('watch:start', 'Start watching files for changes', function(done) {
  gulp.watch(watchGlobs, ['server:restart']);
  done();
});
