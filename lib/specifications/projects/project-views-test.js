/* eslint-env jasmine */
'use strict';

describe('Views applied to project data', function() {
  var applyView;
  var projectData;
  var renderingData;

  beforeAll(function() {
    applyView = require('./views').applyView;
  });

  beforeEach(function() {
    projectData = {};
    renderingData = {};
  });

  it('should handle empty objects being passed.', function() {
    let ret = applyView(projectData, renderingData);
    projectData = ret[0];
    renderingData = ret [1];

    expect(projectData).toEqual({});
    expect(renderingData).toEqual({});
  });
});
