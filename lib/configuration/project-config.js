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

module.exports = {
  getConfigFilePath: getConfigFilePath,
  parseConfig: parseConfig
};


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

  // Get the project views from the project config file.
  processedConfig.projectViews = _processViews(parsedConfig.projectViews);

  // Simple, 'pass-through' properties which don't necessarily exist.
  processedConfig.editUrlFormat = parsedConfig.editUrlFormat;
  processedConfig.ciLink = parsedConfig.ciLink;

  return processedConfig;
}


// Derive data and functions for project views.
// All keys are passed through.
function _processViews(projectViews) {
  var viewNames;

  // Valid undefined argument.
  if (projectViews === undefined) {
    return {};
  }

  // Invalid argument type.
  if (!projectViews || typeof projectViews !== 'object') {
    console.warn('Ignoring invalid project views list, should be a non-null object.');
    console.warn(projectViews);
    return {};
  }

  // Empty list of project views.
  viewNames = Object.keys(projectViews);
  if (!viewNames.length) {
    console.log('Ignoring empty project views list.');
    return {};
  }

  // Decorate the project views with derived data.
  viewNames.forEach(function(viewName) {
    var view = projectViews[viewName];
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

  return projectViews;
}
