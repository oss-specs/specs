# Specs

A service for exposing specifications expressed as Gherkin feature files via a nice web UI.

[![Test Status](https://teamcity.sponte.uk/guestAuth/app/rest/builds/buildType:SpecsExpress_Ci/statusIcon)](https://teamcity.sponte.uk/viewType.html?buildTypeId=SpecsExpress_Ci&branch_OssSpecs=%3Cdefault%3E&tab=buildTypeStatusDiv)
[![Dependency Status](https://david-dm.org/oss-specs/specs.svg)](https://david-dm.org/oss-specs/specs)
[![Code Climate](https://codeclimate.com/github/oss-specs/specs/badges/gpa.svg)](https://codeclimate.com/github/oss-specs/specs)
[![Test Coverage](https://codeclimate.com/github/oss-specs/specs/badges/coverage.svg)](https://codeclimate.com/github/oss-specs/specs/coverage)


Start the server, in the UI specify a https URL for a Git repo, and if that repo contains markdown or feature files they will be displayed. The idea is to make specifications stored in a repo visible and searchable, for people who aren't familiar with version control systems, and as part of a living documentation system.

If you want to run Specs as a service we recommend you use the Docker instructions given below.


## Development installation instructions

* Install [node](https://nodejs.org/).
* Clone this repository.
* Move to the cloned project directory and run `npm install`.
* To start the server locally `npm start` -- by default the web UI will be visible at [http://localhost:3000/](http://localhost:3000/).
* Build tasks are defined in [Gulp](http://gulpjs.com/) so if you want to use them install Gulp globally `npm install --global gulp`. If you would like to see a list of available tasks just type `gulp`. There are some other tasks defined in the package.json which are currently used for CI purposes.


## Installing as a service using npm

To install the latest version from npm
* `npm install -g oss-specs`.
* To start the server `oss-specs`.
* The service should be running and visible at [http://localhost:3000/](http://localhost:3000/).

## Installing as a service using Docker

* If you haven't already then [install Docker](https://docs.docker.com/installation/).
* On the Docker command line `docker run -Pd specs/specs` to run the container in the background and map ports from the container to the containing VM.
* The service should be running and visible at the IP of the Docker VM on whatever port Docker mapped the to.

Alternatively, get the container image here https://hub.docker.com/r/specs/specs/ and start it in whatever way you prefer.

## Configuration

There are two types of possible configuration:

### App wide configuration through environment variables

* SPECS_OUT_DIR - Specifies location of project-data folder, by default this lives in the root of the project.
* SPECS_ALLOW_INSECURE_SSL - Disables SSL certificate verification when cloning repos.

### Project specific configuration via a specs.json file
The file should be in the root of your repository. The file an be named `specs.json` or `.specs.json` .See the [.specs.json](.specs.json) file in the root of this repository for an example.

Keys:
 * views: An object with keys specifying named view configurations. Allowed keys are:
   * excludedPaths - An array of folder paths to exclude from the UI on the project page.
   * pathsToHide - Specify beginnings of directory paths to hide on the project page. E.g. if you specified 'src/test/specs' then a directory 'src/test/specs/my_wondeful_feature' would be displayed in the directory list as '... my_wonderful_feature'.

(C) 2015
