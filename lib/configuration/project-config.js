/**
 * Project specific config.
 *
 * Specified in a specs.json file in the root of the project of interest.
 */
'use strict';

var path = require('path');

var isArray = Array.isArray.bind(Array);

var configFileName = 'specs.json';

function _processViews(views) {
  var viewNames;

  if (views === undefined) {
    return {};
  }

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

      view.regex.excludedPaths = new RegExp('^(' + view.excludedPaths.join('|') + ')');

      view.helpers.isExcludedPath = function(path) {
        return view.regex.excludedPaths.test(path);
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
  });

  return views;
}

// Config files live in the root of the project of interest.
function getConfigFilePath() {
  return path.normalize(configFileName);
}

function parseConfig(configString) {
  var parsedConfig = {};

  // Attempt to parse the config file.
  try {
    parsedConfig = JSON.parse(configString);
  } catch (error) {
    console.warn("Could not parse specs.json file.");
    console.warn(error);
    return {};
  }

  parsedConfig.views = _processViews(parsedConfig.views);

  return parsedConfig;
}


module.exports = {
  getConfigFilePath: getConfigFilePath,
  parseConfig: parseConfig
}
