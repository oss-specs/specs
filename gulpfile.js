/**
 * Entry point for defining Gulp tasks.
 */

// Pull in the tasks from the gulp-tasks directory.
require('require-dir')('./gulp/tasks');

// TODO: coverage https://github.com/oss-specs/specs/issues/65.
// "test-with-coverage": "PORT=1337 node_modules/.bin/istanbul cover node_modules/.bin/cucumber-js --report teamcity --report lcov -- --require features-support -f progress",
// "upload-coverage-data": "node_modules/.bin/codeclimate-test-reporter < coverage/lcov.info",
