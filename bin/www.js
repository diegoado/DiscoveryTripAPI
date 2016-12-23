#!/usr/bin/env node

var debug = require('debug')('restapi'),
    https = require('http');

// Find the src path
var src = process.cwd() + '/src/';

var app = require(src + 'app'),
    conf = require(src + 'helpers/conf'),
    mailer = require(src + 'helpers/mailer'),
    log = require(src + 'helpers/log')(module);

app.set('port', process.env.PORT || conf.get('port') || 3000);

// Create a server HTTPS
var server = https.createServer(app);

server.listen(app.get('port'), function () {
    var message = 'Express server listening on port ' + app.get('port');
    server.emit('open', null);

    debug(message);
    log.info(message);
});

server.once('open', function () {
    mailer.isRunning()
        .then(function () {
            log.info("Server is enabled to send password reminder messages to users");
        })
        .catch(function (err) {
            log.error("Server is not  enabled to send password reminder messages to users. Error caused by: " + err.message);
        })
});
