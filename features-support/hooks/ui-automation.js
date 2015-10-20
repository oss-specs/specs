'use strict';

var WebDriver = require('selenium-webdriver');

module.exports = function beforeHooks() {

  String.prototype.toCamelCase = function() {
      return this.replace(/^([A-Z])|\s(\w)/g, function(match, p1, p2, offset) {
          if (p2) return p2.toUpperCase();
          return p1.toLowerCase();
      });
  };


  function getCustomCapabilitiesFromEnvironment() {
    var saucelabsProperties = {};

    for(var key in process.env) {
      if(/^SAUCELABS_.*/.test(key)) {
        var sanitisedKey = key
          .replace(/^SAUCELABS_/, '')
          .split(/_/)
          .map(function (item) { return item.toLowerCase();})
          .join(" ")
          .toCamelCase();
        saucelabsProperties[sanitisedKey] = process.env[key];
      }
    }

    return saucelabsProperties;
  }

  // Remove any old test data.
  this.Before('@ui-automation', function(callback) {
    var world = this;

    // this is defaults, can be overriden through environment variables
    // http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_builder_class_Builder.html
    world.browser = new WebDriver.Builder()
      .forBrowser('chrome')
      .withCapabilities(getCustomCapabilitiesFromEnvironment())
      .build();
    callback();
  });


    // Remove any old test data.
    this.After('@ui-automation', function(callback) {
      var world = this;
      world.browser.quit();
      callback();
    });
}
