var express = require('express'),
    path = require('path'), // path parsing module
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    methodOverride = require('method-override');

var app = express(),
    src = process.cwd() + '/src/';

require(src + 'auth/auth');
var log = require('./helpers/log')(module);

// Load routes
var api = require('./routes/api'),
    users = require('./routes/users'),
    oauth = require('./routes/oauth'),
    attractions = require('./routes/attractions');

app.use(cookieParser());
app.use(methodOverride());  // HTTP PUT and DELETE support
app.use(bodyParser.json()); // JSON parsing
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));

// Register routes
app.use('/', api);
app.use('/api', api);
app.use('/api', oauth);
app.use('/api/users', users);
app.use('/api/attractions', attractions);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404);
    log.error('%s %d %s', req.method, res.statusCode, req.url);

    res.json({status: 'error', error: 'user_error', error_description: 'Resource not found'});
    next();
});

// Error handlers
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    log.error('%s %d %s', req.method, res.statusCode, err.message);

    res.json({status: 'error', error: err.code || 'server_error', error_description: err.message});
    next();
});

module.exports = app;
