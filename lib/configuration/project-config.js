/**
 * Project specific config.
 *
 * Specified in a specs.json file in the root of the project of interest.
 */
 /* eslint no-console: 0 */
'use strict';

var path = require('path');

var isArray = Array.isArray.bind(Array);

var configFileName = 'specs.json';

// Derive data and functions for views.
// All keys are passed through.
function _processViews(views) {
  var viewNames;

  // Valid undefined argument.
  if (views === undefined) {
    return {};
  }

  // Invalid argument type.
  if (!views || typeof views !== 'object') {
    console.warn('Ignoring invalid views list, should be a non-null object.');
    console.warn(views);
    return {};
  }

  // Empty list of views.
  viewNames = Object.keys(views);
  if (!viewNames.length) {
    console.log('Ignoring empty views list.');
    return {};
  }

  // Decorate the views with derived data.
  viewNames.forEach(function(viewName) {
    var view = views[viewName];
    var excludedPaths = view.excludedPaths;
    var pathsToHide = view.pathsToHide;

    view.regex = {};
    view.helpers = {};

    // Paths to be removed from the file list.
    if (excludedPaths !== undefined) {
      if (!isArray(excludedPaths)) {
        console.warn('excludedPaths should be an array of strings. Ignoring view \'' + view.name + '\'.');
        console.warn(excludedPaths);
        view.error = true;
        return;
      }

      view.hasExcludedPaths = true;
      view.regex.excludedPaths = new RegExp('^(' + view.excludedPaths.join('|') + ')');

      view.helpers.isIncludedPath = function(path) {
        return !view.regex.excludedPaths.test(path);
      };
    }

    // Parts of paths to be truncated in the UI, see README for details.
    if (pathsToHide !== undefined) {
      if (!isArray(pathsToHide)) {
        console.warn('pathsToHide should be an array of strings. Ignoring view \'' + view.name + '\'.');
        console.warn(pathsToHide);
        view.error = true;
        return view;
      }
      pathsToHide = pathsToHide.map(path.normalize);
      view.regex.pathsToHide = new RegExp('^(' + view.pathsToHide.join('|') + '\/?)(?![w-])');
    }

    // Anchor path for the view.
    if (view.anchor !== undefined) {
      if (typeof view.anchor !== 'string') {
        console.warn('anchor should be a string. Ignoring view \'' + view.name + '\'.');
        console.warn(view.anchor);
        view.error = true;
        return view;
      }
      view.hasAnchor = true;
      view.anchor = path.normalize(view.anchor);
      view.regex.anchor = new RegExp('^' + view.anchor + '\/?(?![w-])');

      view.helpers.isWithinAnchor = function(filePath) {
        return view.regex.anchor.test(filePath);
      };
    }
  });

  return views;
}

// Config files live in the root of the project of interest.
function getConfigFilePath() {
  return path.normalize(configFileName);
}

function parseConfig(configString) {
  var parsedConfig = {};
  var processedConfig = {};

  // Attempt to parse the config file.
  try {
    parsedConfig = JSON.parse(configString);
  } catch (error) {
    console.warn('Could not parse specs.json file.');
    console.warn(error);
    return {};
  }

  console.log("^^^^^");
  console.log(parsedConfig);

  // Get the views from the project config file.
  processedConfig.views = _processViews(parsedConfig.views);

  processedConfig.editUrlFormat = parsedConfig.editUrlFormat;

  return processedConfig;
}


module.exports = {
  getConfigFilePath: getConfigFilePath,
  parseConfig: parseConfig
};
