#!/usr/bin/env node
var debug = require('debug')('restapi'),
    src = process.cwd() + '/src/'; // Find the src path

var app = require(src + 'app'),
    conf = require(src + 'conf'),
    log = require(src + 'log')(module);

app.set('port', process.env.PORT || conf.get('port') || 3000);

var server = app.listen(app.get('port'), function() {
    var message = 'Express server listening on port ' + app.get('port');

    log.info(message);
    debug(message);
});
