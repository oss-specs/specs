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
  return path;
}

// URI encode a string.
function uriEncodeString(context) {
  return encodeURIComponent(context);
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
  uriEncodeString: uriEncodeString
};
