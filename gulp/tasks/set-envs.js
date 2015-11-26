// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));
var argv = require('minimist')(process.argv.slice(2));

gulp.task('set-envs:test', 'Set testing environment variables.', function(done) {
  process.env.NODE_ENV = 'development';
  process.env.PORT = process.env.PORT || 2222;

  if(argv.browser) process.env.SELENIUM_BROWSER = argv.browser;
  if(argv.platform) process.env.SELENIUM_PLATFORM = argv.platform;

  done();
});
