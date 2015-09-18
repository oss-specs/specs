/**
 * Factory for singleton Config data object for the app.
 */
'use strict';

var path = require('path');

var dirs = {
  dataStorage: 'project-data'
}

// Cached instance of Config.
var configInstance;

function Config(rootPath) {
  this.rootPath = rootPath;
  this.dataStoragePath = path.join(rootPath, dirs.dataStorage);
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
function set(rootPath) {
  if (configInstance instanceof Config) {
    throw new TypeError('Please only call the set mothod once.');
  }
  if (!rootPath) {
    throw new TypeError('Please supply the app root path to the config set method.');
  }
  configInstance = new Config(path.normalize(rootPath));
  return configInstance;
}

module.exports = {
  get: get,
  set: set
};
