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
    if(/^SAUCELABS_.*/.test(key)) {
      var sanitisedKey = key
        .replace(/^SAUCELABS_/, '')
        .split(/_/)
        .map(function (item) { return item.toLowerCase(); })
        .join(' ');
      sanitisedKey = toCamelCase(sanitisedKey);
      saucelabsProperties[sanitisedKey] = process.env[key];
    }
    if(/^SAUCE_.*/.test(key)) {
      saucelabsProperties[key] = process.env[key];
    }
  });

  // Set up sauce labs credentials.
  // This will fail unless SauceConnect is running.
  // And possibly fail if sauce connect is working
  // because the credentials are in the URL.
  var user = saucelabsProperties['SAUCE_USERNAME'];
  var accessKey = saucelabsProperties['SAUCE_ACCESS_KEY'];
  var remoteURL = process.env['SELENIUM_REMOTE_URL'];
  if (user && accessKey && remoteURL) {
    remoteURL = remoteURL.replace(/^http:\/\//, 'http://' + user + ':' + accessKey + '@');
    process.env['SELENIUM_REMOTE_URL'] = remoteURL;
  }

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

    // this is defaults, can be overriden through environment variables
    // http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_builder_class_Builder.html
    try {
      world.browser = new webdriver.Builder()
        .withCapabilities(getCapabilities(webdriver))
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
};
