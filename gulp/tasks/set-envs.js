// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

gulp.task('set-envs:test', 'Set testing environment variables.', function(done) {
  process.env.NODE_ENV = 'development';
  process.env.PORT = process.env.PORT || 2222;
  done();
});
