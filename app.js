var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var validator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var config = require('./config');
mongoose.Promise = require('bluebird');
mongoose.connect(config.db_string);
var User = require('./models/user');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());

// Passport config
app.use(passport.initialize());
passport.use(new LocalStrategy({session: false}, User.authenticate()));

// Development print mongoose debug
if (config.env == 'dev') {
  mongoose.set('debug', true);
}

// App Router
app.use(require('./router'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (config.env == 'dev') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
      .json({
        success: false,
        message: err.message
    });
  });
}

// Production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
      .json({
        success: false,
        message: 'Request failed'
      });
});

module.exports = app;
