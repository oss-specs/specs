# Specs
[![Dependency Status](https://david-dm.org/oss-specs/specs.svg)](https://david-dm.org/oss-specs/specs)
[![Code Climate](https://codeclimate.com/github/oss-specs/specs/badges/gpa.svg)](https://codeclimate.com/github/oss-specs/specs)
[![Test Coverage](https://codeclimate.com/github/oss-specs/specs/badges/coverage.svg)](https://codeclimate.com/github/oss-specs/specs/coverage)

A service for exposing specifications expressed as Gherkin feature files via a nice web UI.

This software is alpha, in that it doesn't do much useful yet. Feature files dropped into a `public/feature-files` directory will be visible in the UI, the best way to see this is the run the tests then start the server and view the UI in a browser.

For a full specification please see the [features](/features) folder, and hopefully soon a nice web page.

## Development installation instructions

* Install [node](https://nodejs.org/).
* Clone this repository.
* `npm install`.
* To test locally `npm run cuke`, to test and generate JUnit XML (for CI) `npm test`.
* To start the service `npm start` -- by default the web UI will be visible at http://localhost:3000 .
* For other tasks see the [package.json](/package.json).

## Usage

* Run the server in develop mode locally `DEBUG=specs:* npm start`.
