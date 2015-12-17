'use strict';

var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var path = require('path');
var morgan = require('morgan');
var fs = require('fs');
var FileStreamRotator = require('file-stream-rotator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');

var appVersion = require('./package.json').version;

// Set the config object for use elsewhere.
// Until we move to dependency injection
// this needs to happen before the
// routes are required as they depend on
// configuration state at require time.
var appConfig = require('./lib/configuration/app-config').set({
  rootPath: process.env.SPECS_OUT_DIR || __dirname,
  allowInsecureSSL: process.env.SPECS_ALLOW_INSECURE_SSL
});

var handlebarHelpers = require(path.join(__dirname,'views', 'helpers'));

// Projects route, current Index.
var projectsRoute = require('./routes/projects');

// The invidual project route.
var projectRoute = require('./routes/project');

// The individual feature/markdown file route within a given project.
var featureRoute = require('./routes/feature');

// The tag cloud and tag list routes for a given project.
var tagViewRoutes = require('./routes/tagviews');


var app = express();

app.use(session({
  store: new FileStore(),
  secret: 'jkdsf8978#*&*E&R(DFk',

  // Have to be set, best values depend on the store being used.
  // https://github.com/expressjs/session#options
  resave: true,
  saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname,'views', 'partials'));
hbs.registerHelper('newlines_to_breaks', handlebarHelpers.newlinesToBreaks);
hbs.registerHelper('newlines_to_paragraphs', handlebarHelpers.newlinesToParagraphs);
hbs.registerHelper('step_content', handlebarHelpers.stepContent);
hbs.registerHelper('directory_path', handlebarHelpers.directoryPath);
hbs.registerHelper('uri_encode', handlebarHelpers.uriEncodeString);

/**
 * LOGGING.
 *
 * Log to standard out and to a file.
 */
app.use(morgan('dev'));
if (app.get('env') !== 'development') {
  var logDirectory = path.join(__dirname, 'log');

  // ensure log directory exists
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  // create a rotating write stream
  var accessLogStream = FileStreamRotator.getStream({
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false
  });

  // setup the logger
  app.use(morgan('combined', {stream: accessLogStream}));
}

/* Other middleware */

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));


/* Routes. */

// Vendor resources in node_modules/ routes.
app.get('/github-markdown-css/github-markdown.css', function(req, res, next) {
  var cssPath = path.join(__dirname, 'node_modules','github-markdown-css','github-markdown.css');
  res.sendFile(cssPath, {}, function(err) {
    if (err) {
      next(err);
    }
  });
});

// Vendor resources in bower_components/ routes.
app.get('/bower/*', function(req, res, next) {
  var filePath = path.join(__dirname, 'bower_components', req.params[0]);
  res.sendFile(filePath, {}, function(err) {
    if (err) {
      next(err);
    }
  });
});

// Front page is the projects page.
// http://host/
app.use(projectsRoute);

// Individual project.
// http://host/project/<project name>
app.use(appConfig.projectRoute, projectRoute);

// Markdown and feature files within a project.
// htpp://host/project/<project name>/file/<root/to/file>
app.use(appConfig.projectRoute, featureRoute);

// Tag cloud
// htpp://host/project/<project name>/tagcloud
app.use(appConfig.projectRoute, tagViewRoutes);

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// Don't delete the unused `next` argument, express inspects
// the arguments to determine behaviour (horrible).
/*eslint-disable no-unused-vars */
app.use(function(err, req, res, next) {
/*eslint-enable no-unused-vars */
  var status = err.status || 500;
  var errorMessage = err.message || err;
  var stack = err.stack || false;
  res.status(status);
  if (parseInt(status, 10) === 404) {
    res.render('four-oh-four');
  } else {
    res.render('error', {
      appVersion: appVersion,
      status: status,
      message: errorMessage,
      stack: stack
    });
  }
});

module.exports = app;
