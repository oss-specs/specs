/**
 * Factory for singleton Config data object for the app.
 */
'use strict';

var path = require('path');
var defaults = require('lodash.defaults');
var assign = require('lodash.assign');

var folderNames = {
  dataStorage: 'project-data',
  projects: 'projects'
};

// List of filename extensions the app cares about.
var filesOfInterest = [
  'feature',
  'md'
];


// Default configuration values.
var defaultValues = {
  // The URL fragment to mount project related routes under.
  projectRoute: '/project',

  // Allow NodeGit to ignore SSL security warnings.
  allowInsecureSSL: false,

  // Paths to not pull files from.
  excludedPaths: false,

  // Paths to not display in the UI.
  // E.g. if your specs are in src/test/integration/specs/cucumber/specs/
  // you probably don't want to see that in the UI.
  pathsToHide: false
};


// Cached instance of Config.
var configInstance;

function Config(configuration) {

  // For each key in defaultValues if the same key in
  // configuration resolves to undefined then replace
  // it with the value in defaultValues.
  defaults(configuration, defaultValues);

  // Copy the values from configuration to this.
  assign(this, configuration);

  this.rootPath = path.normalize(this.rootPath);
  this.dataStoragePath = path.join(this.rootPath, folderNames.dataStorage);
  this.projectsPath = path.join(this.dataStoragePath, folderNames.projects);

  this.regex = {};

  // Define which file types the application willl process and display.
  this.regex.filesOfInterest = new RegExp('\\.(' + filesOfInterest.join('|') + ')$');

  if(this.excludedPaths !== false) {
    this.excludedPaths = this.excludedPaths.split(/\s*,\s*/);
    this.regex.excludedPaths = new RegExp('^(' + this.excludedPaths.join('|') + ')');
  }

  if (this.pathsToHide !== false) {
    this.pathsToHide = this.pathsToHide
                        .split(/\s*,\s*/)
                        .map(path.normalize);
    this.regex.pathsToHide = new RegExp('^(' + this.pathsToHide.join('|') + '\/?)(?![w-])');
  }
}

Config.prototype.isSupportedFile = function(pathToFile) {
  var fileOfInterest = this.regex.filesOfInterest.test(pathToFile);
  if(!fileOfInterest) return false;

  var excludedPath = false;
  if (this.excludedPaths !== false) {
    excludedPath = this.regex.excludedPaths.test(pathToFile);
  }
  return !excludedPath;
};


/**
 * Get the config instance.
 */
function get() {
  if (configInstance instanceof Config) {
    return configInstance;
  }
  throw new TypeError('Please set the root path for the app with the set method before asking for the configuration.');
}


/*
 * Create and cache the config instance. Return instance for convenience.
 */
function set(configuration) {
  if (configInstance instanceof Config) {
    throw new TypeError('Please only call the set mothod once.');
  }
  if (!configuration.rootPath) {
    throw new TypeError('Please supply the app root path to the config set method.');
  }
  configInstance = new Config(configuration);
  return configInstance;
}

module.exports = {
  get: get,
  set: set
};
