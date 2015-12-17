/**
 * Functionality relating to views into the project data structure.
 *
 * Views are defined in the specs.json file and applied to the projectData
 * data structure, currently used in the project view.
 */
'use strict';

module.exports = {
  applyProjectView: applyProjectView,
  modifyProjectView: modifyProjectView
};

function applyProjectView(projectData, renderingData) {
  var currentProjectViewName = renderingData.currentProjectViewName;
  var projectView = {};
  var viewNames = [];

  // If the project config contains specified views use them.
  if (projectData.config) {
    viewNames = Object.keys(projectData.config.projectViews);
  }

  if (viewNames.length > 0) {
    renderingData.hasProjectViews = true;

    // No view specified, attempt to use a DEFAULT view.
    if (currentProjectViewName === false) {
      // The defaultView value may be undefined, that will result in no view logic being applied.
      currentProjectViewName = viewNames
                     .filter(function(name) {
                       return !!projectData.config.projectViews[name].default;
                     })[0] || false;
    }

    // Generate view name data for the UI.
    renderingData.projectViewNames = viewNames.map(function (viewName) {
      return {
        name: viewName,
        urlEncodedName: encodeURIComponent(viewName),
        isCurrent: viewName === currentProjectViewName
      };
    });

    // Explicit request for no view logic to be applied.
    if (currentProjectViewName === 'none') {
      projectView = renderingData.projectView = false;

    // Grab any view config that might have been specified in the project config.
    } else {
      projectView = renderingData.projectView = projectData.config.projectViews[currentProjectViewName];
    }

    // Filter the file list based on the excludedPaths in project config.
    if (projectView && projectView.hasExcludedPaths) {
      projectData.files = projectData.files.filter(projectView.helpers.isIncludedPath);
    }

    // Filter the file list based on the anchor path in the project config.
    if (projectView && projectView.hasAnchor) {
      projectData.files = projectData.files.filter(projectView.helpers.isWithinAnchor);
    }
  }

  return [projectData, renderingData];
}

function modifyProjectView(renderingData) {

  // Don't default collapse the view if a tag has been requested.
  if (renderingData.tagRequested) {
    if (renderingData.projectView) {
      renderingData.projectView['start collapsed'] = false;
    }
  }

  return renderingData;
}
