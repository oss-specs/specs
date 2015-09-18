"use strict";

var express = require('express');
var path = require('path');
var morgan = require('morgan');
var fs = require('fs');
var FileStreamRotator = require('file-stream-rotator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');

var appConfiguration = require('./lib/configuration');

var handlebarHelpers = require(path.join(__dirname,'views', 'helpers'));

// Projects route, current Index.
var projectsRoute = require('./routes/projects');

// The invidual project route.
var projectRoute = require('./routes/project');

// The individual feature/markdown file route.
var featureRoute = require('./routes/feature');


var app = express();

// Set the config object for use elsewhere.
appConfiguration.set(__dirname);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname,'views', 'partials'));
hbs.registerHelper('newlines_to_breaks', handlebarHelpers.newlinesToBreaks);
hbs.registerHelper('newlines_to_paragraphs', handlebarHelpers.newlinesToParagraphs);
hbs.registerHelper('step_content', handlebarHelpers.stepContent);


/* HTTP logging middleware. */

// Standard out.
app.use(morgan('dev'));

// Log to disk.
if (app.get('env') !== 'development') {
  var logDirectory = path.join(__dirname, 'log');
  // ensure log directory exists
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  // create a rotating write stream
  var accessLogStream = FileStreamRotator.getStream({
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false
  })
  // setup the logger
  app.use(morgan('combined', {stream: accessLogStream}))
}

/* Other middleware */

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));


/* Routes. */

// Front page is the projects page.
// http://host/
app.use(projectsRoute);

// Individual project.
// http://host/<project name>
app.use(projectRoute);

// Files of interest
// htpp://host/<project name>/<root/to/file>
app.use(featureRoute);

// Special resources in node_modules/ routes.
app.get('/github-markdown-css/github-markdown.css', function(req, res, next) {
  var cssPath = path.join(__dirname, 'node_modules','github-markdown-css','github-markdown.css');
  res.sendFile(cssPath, {}, function(err) {
    if (err) {
      next(err);
    }
  });
});

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  var status = err.status || 500;
  var errorMessage = err.message || err;
  var stack = err.stack || false;
  res.status(status)
  if (status == 404) {
    res.render('four-oh-four');
  } else {
    res.render('error', {
      status: status,
      message: errorMessage,
      stack: stack
    });
  }
});

module.exports = app;
