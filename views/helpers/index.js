'use strict';

var handlebars = require('hbs').handlebars;

/**
 * Arguments are typically surround by double quotes
 * or single quotes ('). Ignoring typographic left
 * and right single quotes for simplicity.
 *
 * Strictly speaking parameters are defined by an
 * arbitrary regex, but quotes are typical so
 * highlighting them adds probable value.
 *
 * quote: &#34; &quot;
 * mixed single quote/apostrophe: &#39 &apos ';
 * left single quote: &#8216;
 * right single quote: &#8217;
 * <: &#60; &lt;
 * >: &#61; &gt;
 */
function highlightStepParams(context, options) {
  var safeContent = options.fn(context);
  var ungreedyThingsInQuotes = /(?:&#34;|&quot;|&39;|&apos;).+?(?:&#34;|&quot;|&39;|&apos;)/g;
  var ungreedyThingsInChevrons = /(?:&#60;|&lt;).+?(?:&#61;|&gt;)/g;

  safeContent = safeContent.replace(ungreedyThingsInQuotes, function(match) {
    return '<span class="quoted">' + match + '</span>';
  });

  safeContent = safeContent.replace(ungreedyThingsInChevrons, function(match) {
    return '<span class="chevroned">' + match + '</span>';
  });

  return '<span class="step-name">' + safeContent + '</span>';
}

// http://www.2ality.com/2014/01/efficient-string-repeat.html
// N.b. ES6 will do this with string.prototype.repeat.
/*eslint-disable no-constant-condition */
function stringRepeat(str, num) {
  num = Number(num);
  var result = '';
  while (true) {
    if (num & 1) {
      result += str;
    }
    num >>>= 1;
    if (num <= 0) {
      break;
    }
    str += str;
  }
  return result;
}
/*eslint-enable no-constant-condition */

// Render leading whitespace characters.
function encodeLeadingWhitespace(content) {
  return content.replace(/^\s+/, function(match) {
    var nbsp = '<span class="leadingWhitespace">&nbsp;</span>';
    return stringRepeat(nbsp, match.length);
  });
}

function getStringConverter(aggregator) {
  return function(context, options) {
    var content = context.split('\n');
    content = content.reduce(function(previous, current) {

      // Gaurantee rendered content.
      var safeContent = options.fn(current) || '&nbsp;';
      return previous += aggregator(encodeLeadingWhitespace(safeContent));
    }, '');
    return new handlebars.SafeString(content);
  };
}

function parseDirectoryPath(context, options) {
  var path = context;
  var pathsToHideRegex = options.hash.pathsToHideRegex;
  if (pathsToHideRegex) {
    path = path.replace(pathsToHideRegex, '<span class="redacted"></span>');
  }
  return path.replace(/\//g, ' / ');
}

// URI encode a string.
function uriEncodeString(context) {
  return encodeURIComponent(context);
}

/*
 *Using an array of json objects of cases from jenkins and the scenario name to match the test results to a feature.
 *
 * @param {Object} array        An array from jenkins of json objects for each case found
 * @param {Object} scenario     Contains all the details for the feature including scenario name and type
 * @return {Object} passes      The string representing the html to display buttons for the associated passes
 */
function checkResultsFromList(array, scenario) {
  if (array && array.length > 0) {
    var passes ='';
    var scenarioName= scenario.name;
    if(scenario.type === 'ScenarioOutline' ) {
      var updatedName = scenarioName;
      if (scenarioName.indexOf('<') > -1) {
        for (var j = 0; j < scenario.examples.length; j++) {
          for (var iBody = 0; iBody < scenario.examples[j].tableBody.length; iBody++) {
            for (var iHeader = 0; iHeader < scenario.examples[j].tableHeader.cells.length; iHeader++) {
              var re = new RegExp('<' + scenario.examples[j].tableHeader.cells[iHeader].value + '>', "g");
              updatedName = updatedName.replace(re, scenario.examples[j].tableBody[iBody].cells[iHeader].value);
            }
            passes = passes += compareJobsAndFeatures(array, updatedName, true);
            updatedName = scenarioName;
          }
        }
      } else {
        //If there is no example data in the scenario name then jenkins will report with numbers in a different order
        // so just return the link the the job rather than the direct test
        passes = passes += compareJobsAndFeatures(array, scenarioName, false);
      }
    }
    else {
      passes = compareJobsAndFeatures(array,scenarioName, true);
    }
    return passes;
  }
}

/**
 * Takes in the scenario name and a array of json object to check if the scenario has passed
 * @param array         An array of json objects for jobs, containing details such as the name, the status and the url
 * @param scenarioName  the name of scenario we wish to check against
 * @param directFeature When true return a direct link to the scenario, when false return link to more general job.
 * @returns {string}    The string representing the html for displaying the results
 */
function compareJobsAndFeatures(array, scenarioName,directFeature) {
  if (array && array.length > 0) {
    var passes ='';
    for( var i = 0; i < array.length ; i++) {
      //If we check direct equals then we miss out some in scenario outline that end in digits, so needs changing
      //previously tested name contained second but this caused some tests to show extra results
      var storedJob = array[i]['name'].replace(/ \d+$/g,'');
      // if scenarioName has ' - <' then remove after - in storedJob
      if (storedJob=== scenarioName) {
        var status = array[i]['status'];
        switch (status) {
          case 'FIXED':
            status = 'PASSED';
            break;
          case 'REGRESSION':
            status = 'FAILED';
            break;
        }
        var url = array[i]['url'];
        var scen = array[i]['className'].replace(/ /g, '%20');
        if(directFeature) {
          var feat = '/' + array[i]['name'].replace(/ /g, '_').replace(/\W/g, '_');
          url = url.replace('api/json?pretty=true', 'junit/(root)/' + scen + feat);
        } else {
          url = url.replace('api/json?pretty=true', 'junit/(root)/' + scen);
        }
        passes = passes + '<a class="resultLink" href="' + url + '"><input class="' + status + '" type="submit" value="' + status + '"></a><br/>';
      }
    }
    return passes;
  }
}

module.exports = {
  newlinesToBreaks: getStringConverter(function toBreaks(safeContent) {
    return safeContent + '<br>';
  }),
  newlinesToParagraphs: getStringConverter(function toParagraphs(safeContent) {
    return '<p>' + safeContent + '</p>';
  }),
  stepContent: highlightStepParams,
  directoryPath: parseDirectoryPath,
  uriEncodeString: uriEncodeString,
  checkResultsFromList:checkResultsFromList
};
