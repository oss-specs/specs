// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

gulp.task('Hello', 'Hello world task', function(done) {
  console.log("hello world");
  done();
});
