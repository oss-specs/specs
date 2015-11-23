/**
 * Functionality relating to views into the project data structure.
 *
 * Views are defined in the specs.json file and applied to the projectData
 * data structure, currently used in the project view.
 */
'use strict';

module.exports = {
  applyView: applyView
};

function applyView(projectData, renderingData) {
  var currentViewName = renderingData.currentViewName;
  var view = {};
  var viewNames = [];

  // If the project config contains specified views use them.
  if (projectData.config) {
    viewNames = Object.keys(projectData.config.views);
  }

  if (viewNames.length > 0) {
    renderingData.hasViews = true;

    // No view specified, attempt to use a DEFAULT view.
    if (currentViewName === false) {
      // The defaultView value may be undefined, that will result in no view logic being applied.
      currentViewName = viewNames
                     .filter(function(name) {
                       return !!projectData.config.views[name].default;
                     })[0] || false;
    }

    // Generate view name data for the UI.
    renderingData.viewNames = viewNames.map(function (viewName) {
      return {
        name: viewName,
        urlEncodedName: encodeURIComponent(viewName),
        isCurrent: viewName === currentViewName
      };
    });

    // Explicit request for no view logic to be applied.
    if (currentViewName === 'none') {
      view = renderingData.view = false;

    // Grab any view config that might have been specified in the project config.
    } else {
      view = renderingData.view = projectData.config.views[currentViewName];
    }

    // Filter the file list based on the excludedPaths in project config.
    if (view && view.hasExcludedPaths) {
      projectData.files = projectData.files.filter(view.helpers.isIncludedPath);
    }

    // Filter the file list based on the anchor path in the project config.
    if (view && view.hasAnchor) {
      projectData.files = projectData.files.filter(view.helpers.isWithinAnchor);
    }
  }

  return [projectData, renderingData];
}
