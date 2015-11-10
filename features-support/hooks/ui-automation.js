/**
 * Set up Selenium WebDriver for UI tests.
 */
'use strict';

var webdriver;

/*
 * Convert a string to camel case.
 * @param  String string The string to modify.
 * @return String        The modified string.
 */
function toCamelCase(string) {
  return string.replace(/^([A-Z])|\s(\w)/g, function(match, p1, p2) {
    if (p2) {
      return p2.toUpperCase();
    }
    return p1.toLowerCase();
  });
}

function getCustomCapabilitiesFromEnvironment() {
  var saucelabsProperties = {};

  // Loop over enumerable keys without going up the prototype chain.
  Object.keys(process.env).forEach(function(key) {

    // Prefixed general environment variables.
    if(/^SAUCELABS_.*/.test(key)) {
      var sanitisedKey = key
        .replace(/^SAUCELABS_/, '')
        .split(/_/)
        .map(function (item) { return item.toLowerCase(); })
        .join(' ');
      sanitisedKey = toCamelCase(sanitisedKey);
      saucelabsProperties[sanitisedKey] = process.env[key];
    }
  });

  return saucelabsProperties;
}

function getCapabilities(webdriver) {
  var caps = getCustomCapabilitiesFromEnvironment();
  var browserKey = webdriver.Capability.BROWSER_NAME;
  var firefoxKey = webdriver.Browser.FIREFOX;

  // Default to Firefox
  caps[browserKey] = caps[browserKey] || firefoxKey;

  return caps;
}

module.exports = function seleniumHooks() {
  this.Before('@ui-automation', function(callback) {
    var world = this;

    // Lazy require WebDriver so it isn't pulled in for non-selenium tests.
    webdriver = require('selenium-webdriver');

    var capabilities = getCapabilities(webdriver);

    // this is defaults, can be overriden through environment variables
    // http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_builder_class_Builder.html
    try {
      world.browser = new webdriver.Builder()
        .withCapabilities(capabilities)
        .build();
    } catch (error) {
      callback(error);
    }
    callback();
  });

  // Tidy up.
  this.After('@ui-automation', function(callback) {
    var browser = this.browser;

    var buildNumber = process.env('BUILD_NUMBER') || '';

    browser.getSession()
      .then(function(session) {
        return session.getId();
      })
      .then(function(sessionId) {
        // For Sauce onDemand plugin in TeamCity
        process.stderr('SauceOnDemandSessionID=' + sessionId + 'job-name=oss-specs-' + buildNumber);
        browser.quit();
        callback();
      });
  });
};
