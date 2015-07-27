// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

var sourceGlobs = require('../package.json')['paths'];
var serverGlobs = [sourceGlobs['server-js'], sourceGlobs['view-templates']];

gulp.task('watch:start', 'Start watching files for changes', function(done) {
  gulp.watch(serverGlobs, ['server:restart']);
  done();
});
