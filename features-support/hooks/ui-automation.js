/**
 * Set up Selenium WebDriver for UI tests.
 */
'use strict';

var webdriver;

var pageLoadTimeoutms = 60 * 1000;
var implicitlyWaitTimeoutms = 1 * 1000;

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

  var browserKey = webdriver.Capability.BROWSER_NAME;
  var platformKey = webdriver.Capability.PLATFORM_NAME;

  saucelabsProperties[browserKey] = process.env.SELENIUM_BROWSER || "firefox";
  if(process.env.SELENIUM_PLATFORM) saucelabsProperties[platformKey] = process.env.SELENIUM_PLATFORM;

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
  return caps;
}

module.exports = function seleniumHooks() {
  this.Before('@ui-automation', function(callback) {
    var world = this;
    var timeoutManager;

    // Lazy require WebDriver so it isn't pulled in for non-selenium tests.
    webdriver = require('selenium-webdriver');

    var capabilities = getCapabilities(webdriver);

    // this is defaults, can be overriden through environment variables
    // http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_builder_class_Builder.html
    try {
      var driver = world.browser = new webdriver.Builder()
        .withCapabilities(capabilities)
        .build();

      // Manage timeouts.
      timeoutManager = driver.manage().timeouts();
      timeoutManager.pageLoadTimeout(pageLoadTimeoutms);
      timeoutManager.implicitlyWait(implicitlyWaitTimeoutms);

    } catch (error) {
      callback(error);
    }
    callback();
  });

  // Tidy up.
  this.After('@ui-automation', function() {
    var browser = this.browser;
    browser.quit();
  });
};
