/* eslint-env jasmine */
'use strict';

describe('Views applied to project data', function() {
  var applyProjectView;
  var projectData;
  var renderingData;

  beforeAll(function() {
    applyProjectView = require('./project-views').applyProjectView;
  });

  beforeEach(function() {
    projectData = {};
    renderingData = {};
  });

  it('should handle empty objects being passed.', function() {
    let ret = applyProjectView(projectData, renderingData);
    projectData = ret[0];
    renderingData = ret [1];

    expect(projectData).toEqual({});
    expect(renderingData).toEqual({});
  });
});
