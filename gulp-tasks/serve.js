// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

var server = require( 'gulp-develop-server' );

var packagejson = require('../package.json');

gulp.task('server:start', 'Start serving the app', function(done) {
  var binaryPath = packagejson.bin['module-name'];
  server.listen({
    path: binaryPath,
    env: {
      NODE_ENV: 'development',
      PORT: 1337
    }
  }, done);
});

gulp.task('server:stop', 'Stop serving the app', function(done) {
  server.kill(undefined, done);
});
