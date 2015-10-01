'use strict';

module.exports = function beforeHooks() {

  // Remove any old test data.
  this.Before('@cleanSlate', function(callback) {
    var world = this;
    world.deleteTestSpecs()
      .then(function() {
        callback();
      })
      .catch(function(err) {
        callback(err);
      });
  });
};
