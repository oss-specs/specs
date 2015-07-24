/**
 * Entry point for defining Gulp tasks.
 */

// Pull in the tasks from the gulp-tasks directory.
require('require-dir')('./gulp-tasks');

// serve
// acceptance test
// acceptance test with coverage
// lint
// watch - refresh browser on css or js change, restart server and refresh browser on server logic or template change.
// "prestart": "npm stop",
// "start": "node ./bin/www",
// "stop": "pkill specs || true",
// "pretest": "PORT=1337 npm start & sleep 1",
// "test": "PORT=1337 node_modules/.bin/cucumber-js --require features-support",
// "posttest": "npm stop",
// "pretest-with-coverage": "npm run pretest",
// "test-with-coverage": "PORT=1337 node_modules/.bin/istanbul cover node_modules/.bin/cucumber-js --report teamcity --report lcov -- --require features-support -f progress",
// "posttest-with-coverage": "npm run posttest",
// "upload-coverage-data": "node_modules/.bin/codeclimate-test-reporter < coverage/lcov.info",
// "lint": "node_modules/.bin/eslint ./" 
