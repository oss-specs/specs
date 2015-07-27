/**
 * Entry point for defining Gulp tasks.
 */

// Pull in the tasks from the gulp-tasks directory.
require('require-dir')('./gulp-tasks');

// "pretest-with-coverage": "npm run pretest",
// "test-with-coverage": "PORT=1337 node_modules/.bin/istanbul cover node_modules/.bin/cucumber-js --report teamcity --report lcov -- --require features-support -f progress",
// "posttest-with-coverage": "npm run posttest",

// "upload-coverage-data": "node_modules/.bin/codeclimate-test-reporter < coverage/lcov.info",

// "lint": "node_modules/.bin/eslint ./"
