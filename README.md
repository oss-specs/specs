# Specs

A service for exposing specifications expressed as Gherkin feature files via a nice web UI.

[![Test Status](https://teamcity.sponte.uk/guestAuth/app/rest/builds/buildType:SpecsExpress_Ci/statusIcon)](https://teamcity.sponte.uk/viewType.html?buildTypeId=SpecsExpress_Ci&branch_OssSpecs=%3Cdefault%3E&tab=buildTypeStatusDiv)
[![Dependency Status](https://david-dm.org/oss-specs/specs.svg)](https://david-dm.org/oss-specs/specs)
[![Code Climate](https://codeclimate.com/github/oss-specs/specs/badges/gpa.svg)](https://codeclimate.com/github/oss-specs/specs)
[![Test Coverage](https://codeclimate.com/github/oss-specs/specs/badges/coverage.svg)](https://codeclimate.com/github/oss-specs/specs/coverage)


Start the server, in the UI specify a https URL for a Git repo, and if that repo contains markdown or feature files they will be displayed. The idea is to make specifications stored in a repo visible and searchable, for people who aren't familiar with version control systems, as part of a living documentation system.


## Development installation instructions

* Install [node](https://nodejs.org/).
* Clone this repository.
* Move to the cloned project directory and run `npm install`.
* To start the server locally `npm start` -- by default the web UI will be visible at [http://localhost:3000/](http://localhost:3000/).
* Build tasks are defined in [Gulp](http://gulpjs.com/) so if you want to use them install Gulp globally `npm install --global gulp`. If you would like to see a list of available tasks just type `gulp`. There are some other tasks defined in the package.json which are currently used for CI purposes.


## Installing from npm

To install the latest version from npm:
* `npm install -g oss-specs`.
* To start the server `oss-specs`

The default storage directory for repos and derived data is `project-data/` within the install/clone location. To override this location, for example to allow easy updates of versions without losing existing data, set the environment variable `SPECS_OUT_DIR` to your preferred path.

(C) 2015
