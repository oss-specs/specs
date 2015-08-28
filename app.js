"use strict";

var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');

var indexRoute = require('./routes/get-features');
var featuresRoute = require('./routes/features');
var featureRoute = require('./routes/feature');

var handlebarHelpers = require(path.join(__dirname,'views', 'helpers'));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname,'views', 'partials'));
hbs.registerHelper('newlines_to_breaks', handlebarHelpers.newlinesToBreaks);
hbs.registerHelper('newlines_to_paragraphs', handlebarHelpers.newlinesToParagraphs);
hbs.registerHelper('step_content', handlebarHelpers.stepContent);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Front page, currently the 'get features' page.
app.use('/', indexRoute);

// List of features.
app.use('/features', featuresRoute);

// Individual feature.
app.use('/features', featureRoute);

// Special resources in node_modules routes.
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

// Development error handler.
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
  });
}

// Production error handler.
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
