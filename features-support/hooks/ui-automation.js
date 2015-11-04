/**
 * Set up Selenium WebDriver for UI tests.
 */
'use strict';

var WebDriver;

// To be invoked in the context of a string.
function toCamelCase() {
  return this.replace(/^([A-Z])|\s(\w)/g, function(match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};

function getCustomCapabilitiesFromEnvironment() {
  var saucelabsProperties = {};

  // Loop over enumerable keys without going up the prototype chain.
  Object.keys(process.env).forEach(function(key) {
    if(/^SAUCELABS_.*/.test(key)) {
      key.toCamelCase = toCamelCase;
      var sanitisedKey = key
        .replace(/^SAUCELABS_/, '')
        .split(/_/)
        .map(function (item) { return item.toLowerCase(); })
        .join(" ")
        .toCamelCase();
      saucelabsProperties[sanitisedKey] = process.env[key];
    }
  });

  return saucelabsProperties;
}

module.exports = function seleniumHooks() {
  this.Before('@ui-automation', function(callback) {
    var world = this;

    // Lazy require WebDriver so it isn't pulled in for non-selenium tests.
    WebDriver = require('selenium-webdriver');

    // this is defaults, can be overriden through environment variables
    // http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_builder_class_Builder.html
    try {
      world.browser = new WebDriver.Builder()
        .forBrowser('firefox')
        //.withCapabilities(getCustomCapabilitiesFromEnvironment())
        .build();
    } catch (error) {
      callback(error);
    }
    callback();
  });

  // Tidy up.
  this.After('@ui-automation', function(callback) {
    var world = this;
    try {
      world.browser.quit();
    } catch (error) {
      callback(error);
    }
    callback();
  });
}
