"use strict";
/* eslint new-cap: 0 */

module.exports = function beforeHooks() {

  // Remove any old test data.
  this.Before(function(callback) {
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
