// Initialize geo services
var redis   = require('redis'),
    client  = redis.createClient(),
    geo     = require('georedis').initialize(client);

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module);

// Create sets
var attrSet  = geo.addSet('attractions'),
    eventSet = geo.addSet('events');


exports.addLocalization = function(name, latitude, longitude) {
    if (typeof name === 'string') {
        attrSet.addLocation(name, {latitude: latitude, longitude: longitude}, function (err, reply) {
            if (err) {
                throw err;
            } else
                log.info('The search in attraction ' + name + ' is successfully enabled');
        });
    } else if (typeof name === 'object') {
        eventSet.addLocation(name.toString(), {latitude: latitude, longitude: longitude}, function (err, reply) {
            if (err)
                throw err;
            else
                log.info('The search in event ' + name.toString() + ' is successfully enabled');
        });
    }
};

exports.deleteLocalization = function (name) {
    if (typeof name === 'string') {
        attrSet.removeLocation(name, function (err, reply) {
            if (err)
                throw err;
            else
                log.info('The search in attraction ' + name + ' is successfully disabled')
        });
    } else if (typeof name === 'object') {
        eventSet.removeLocation(name.toString(), function (err, reply) {
            if (err)
                throw err;
            else
                log.info('The search in event ' + name.toString() + ' is successfully disabled');
        });
    }
};