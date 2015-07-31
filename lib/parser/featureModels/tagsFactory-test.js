/**
 * Jasmine uses globals like 'describe'.
 */

'use strict';
/* eslint camelcase: 0 */

var tagsFactory = require('./tagsFactory');
var tags;

describe('The tags object', function() {
  beforeEach(function() {
    tags = tagsFactory();
  });

  it('flush method should return an empty array when the object is empty.', function() {
    var emptyArray = tags.flush();
    expect(Array.isArray(emptyArray)).toBe(true);
    expect(emptyArray.length).toBe(0);
  });

  it('flush method should return one tag after calling add with an argument once.', function() {
    tags.add('@aTag');
    var length = (tags.flush()).length
    expect(length).toBe(1);
  });

  it('flush method should return two tags after calling add with an argument twice.', function() {
    tags.add('@tag1');
    tags.add('@tag2')
    var length = (tags.flush()).length
    expect(length).toBe(2);
  });

  it('flush method should empty the tags list', function() {
    tags.add('@tag1');
    tags.add('@tag2')
    tags.flush();
    var length = (tags.flush()).length
    expect(length).toBe(0);
  });
});
