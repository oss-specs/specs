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

    // Sauce labs specific environment variables.
    if(/^SAUCE_.*/.test(key)) {
      saucelabsProperties[key] = process.env[key];
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

  console.log('$$$$$');
  console.log(caps);
  console.log('$$$$$');

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
  this.After('@ui-automation', function() {
    var browser = this.browser;

    // Cope with this step getting called twice at the end of the run
    // possibly because @ui-automation is a feature tag?
    if (browser.session_ !== undefined) {
      browser.quit();
    }

  });
};
