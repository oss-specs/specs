// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

var cucumber = require('gulp-cucumber');

gulp.task('cucumber', function() {
  return gulp.src('features/**/*.feature').pipe(cucumber({
      'support': 'features-support/**/*.js'
  }));
});
