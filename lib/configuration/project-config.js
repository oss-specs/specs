/**
 * Project specific config.
 *
 * Specified in a specs.json file in the root of the project of interest.
 */
'use strict';

var path = require('path');

var isArray = Array.isArray.bind(Array);

var configFileName = 'specs.json';

// Config files live in the root of the project of interest.
function getConfigFilePath() {
  return path.normalize(configFileName);
}

function parseConfig(configString) {
  var parsedConfig = {};
  var views;

  // Attempt to parse the config file.
  try {
    parsedConfig = JSON.parse(configString);
  } catch (error) {
    console.warn("Could not parse specs.json file.");
    console.warn(error);
    return {};
  }

  views = parsedConfig.views;
  if (views === undefined) {
    return {};
  }

  if (!isArray(views)) {
    console.warn('specs.json `views` property should be an array, ignoring.');
    return {};
  }

  if (!views.length) {
    console.log('Ignoring empty views list.');
    return {};
  }

  // Decorate the views with derived data.
  views = views.map(function(view) {
    var excludedPaths = view.excludedPaths;
    var pathsToHide = view.pathsToHide;

    view.regex = {};
    view.helpers = {};

    if (!view.name) {
      console.warn('Config views must have a `name` property. Ignoring view config.');
      view.error = true;
      return view;
    }

    // Paths to be removed from the file list.
    if (excludedPaths !== undefined) {
      if (!isArray(excludedPaths)) {
        console.warn('excludedPaths should be an array of strings. Ignoring view \'' + view.name + '\'.');
        console.warn(excludedPaths);
        view.error = true;
        return view;
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

    return view;
  });

  return parsedConfig;
}


module.exports = {
  getConfigFilePath: getConfigFilePath,
  parseConfig: parseConfig
}
