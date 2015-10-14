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

// Cached instance of Config.
var configInstance;

function Config(configuration) {
  var defaultValues = {
    projectRoute: '/project',
    allowInsecureSSL: false,
    excludedPaths: false
  };

  // For each key in defaultValues if the same key in
  // configuration resolves to undefined then replace
  // it with the value in defaultValues.
  defaults(configuration, defaultValues);

  // Copy the values from configuration to this.
  assign(this, configuration);

  // ability to exclude certain folders
  if(this.excludedPaths !== false) {
      this.excludedPaths = this.excludedPaths.split(/\s*,\s*/);
  }

  this.rootPath = path.normalize(this.rootPath);
  this.dataStoragePath = path.join(this.rootPath, folderNames.dataStorage);
  this.projectsPath = path.join(this.dataStoragePath, folderNames.projects);

  this.regex = {};

  // Define which file types the application willl process and display.
  this.regex.filesOfInterest = new RegExp('\\.(' + filesOfInterest.join('|') + ')$');
  if (this.excludedPaths) {
    this.regex.excludedPaths = new RegExp('^(' + this.excludedPaths.join('|') + ')');
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
}


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
