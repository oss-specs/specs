// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

// Sequential Gulp tasks
var runSequence = require('run-sequence').use(gulp);

var cucumber = require('gulp-cucumber');

// Run all the Cucumber features, doesn't start server
// Hidden from gulp-help.
gulp.task('cucumber', false, function() {
  return gulp.src('features/**/*.feature').pipe(cucumber({
      'support': 'features-support/**/*.js'
  }));
});

gulp.task('test:features', 'Test the features', function(done) {
  runSequence('set-envs',
              'server:start',
              'cucumber',
              'server:stop',
              done);
});
