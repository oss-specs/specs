/**
 * Factory for singleton Config data object for the app.
 *
 * App wide config.
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
  allowInsecureSSL: false
};


// Cached instance of Config.
var configInstance;

function Config(configuration) {

  // For each key in defaultValues if the same key in
  // configuration resolves to undefined then replace
  // it with the value in defaultValues.
  defaults(configuration, defaultValues);

  // Convert values intended to be logical switches to booleans.
  configuration.allowInsecureSSL = !!configuration.allowInsecureSSL;

  // Copy the values from configuration to this.
  assign(this, configuration);

  this.rootPath = path.normalize(this.rootPath);
  this.dataStoragePath = path.join(this.rootPath, folderNames.dataStorage);
  this.projectsPath = path.join(this.dataStoragePath, folderNames.projects);

  this.regex = {};

  // Define which file types the application willl process and display.
  this.regex.filesOfInterest = new RegExp('\\.(' + filesOfInterest.join('|') + ')$');
}

// Test for files of interest.
Config.prototype.isFileOfInterest = function(pathToFile) {
  return this.regex.filesOfInterest.test(pathToFile);
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
