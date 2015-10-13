/**
 * Factory for singleton Config data object for the app.
 */
'use strict';

var path = require('path');
var assign = require('lodash.assign');

var folderNames = {
  dataStorage: 'project-data',
  derived: 'derived',
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
  this.projectRoute = '/project';
  this.allowInsecureSSL = false;

  assign(this, configuration);

  this.rootPath = path.normalize(this.rootPath);
  this.dataStoragePath = path.join(this.rootPath, folderNames.dataStorage);
  this.derivedDataPath = path.join(this.dataStoragePath, folderNames.derived);
  this.projectsPath = path.join(this.dataStoragePath, folderNames.projects);

  this.regex = {};

  // Define which file types the application willl process and display.
  this.regex['fileOfInterest'] = new RegExp('\\.(' + filesOfInterest.join('|') + ')$');
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
