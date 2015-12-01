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

function getCustomCapabilitiesFromEnvironment(webdriver) {
  var saucelabsProperties = {};

  var browserKey = webdriver.Capability.BROWSER_NAME;
  var platformKey = webdriver.Capability.PLATFORM_NAME;

  var browserValue = process.env.SELENIUM_BROWSER || webdriver.Browser.FIREFOX;

  // Object.values() will be in ES7, but until then...
  let validBrowser = false;
  for (let key in webdriver.Browser) {
    validBrowser = webdriver.Browser[key] === browserValue;
    if (validBrowser) {
      break;
    }
  }

  if (validBrowser) {
    saucelabsProperties[browserKey] = browserValue;
  } else {
    /* eslint-disable no-console */
    console.warn('Unsupported browser requested, ignoring: ', browserValue);
    /* eslint-enable no-console */
  }


  if(process.env.SELENIUM_PLATFORM) {
    saucelabsProperties[platformKey] = process.env.SELENIUM_PLATFORM;
  }

  // Parse any prefixed general environment variables,
  // e.g. SAUCELABS_BUILD on teamcity.
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
  });

  return saucelabsProperties;
}

module.exports = function seleniumHooks() {
  this.Before('@ui-automation', function(scenario, callback) {
    var world = this;
    var timeoutManager;

    // Lazy require WebDriver so it isn't pulled in for non-selenium tests.
    webdriver = require('selenium-webdriver');

    var capabilities = getCustomCapabilitiesFromEnvironment(webdriver);

    // Set the meta data for possbile use by SauceLabs.
    capabilities.name = scenario.getName() || undefined;
    capabilities.tags = scenario.getTags().map((t) => t.getName()) || undefined;

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
  this.After('@ui-automation', function(scenario, callback) {
    var browser = this.browser;

    browser.getSession().then(function(session) {

      // Communicate the Sauce Id to TeamCity Sauce plugin.
      /* eslint-disable no-console */
      console.error('SauceOnDemandSessionID=%s job-name=%s', session.getId(), scenario.getName());
      /* eslint-enable no-console */

      browser.quit();
      callback();
    });
  });
};
