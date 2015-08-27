"use strict";

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');

var indexRoute = require('./routes/index');
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

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Front page.
app.use('/', indexRoute);

// List of features.
app.use('/features', featuresRoute);

// Individual feature.
app.use('/features', featureRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.send(err);
  });
}

// Production error handler.
app.use(function(err, req, res) {
  var errorMessage = err.message || err;
  var stack = err.stack || false;
  res.status(err.status || 500);
  res.render('error', {
    message: errorMessage,
    stack: stack
  });
});

module.exports = app;
