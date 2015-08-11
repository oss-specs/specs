// Use the gulp-help plugin which defines a default gulp task
// which lists what tasks are available.
var gulp = require('gulp-help')(require('gulp'));

// https://github.com/narirou/gulp-develop-server
// Relies on default or defineable signals from the child
// server process to detect start success and error
// http://stackoverflow.com/a/10394457
var server = require('gulp-develop-server');

var packagejson = require('../../package.json');
var binaryPath = packagejson.bin['module-name'];

gulp.task('server:start', 'Start serving the app.', ['set-envs:test'], function(done) {
  server.listen({
    path: binaryPath,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    }
  }, done);
});

gulp.task('server:stop', 'Stop serving the app.', function(done) {
  server.kill(undefined, done);
});

gulp.task('server:restart', 'Restart the server.', function(done) {
    server.restart(function(error) {
      done(error);
    });
});
