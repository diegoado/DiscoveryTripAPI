// Initialize geo services
var redis   = require('redis'),
    client  = redis.createClient(process.env.REDIS_URL),
    geo     = require('georedis').initialize(client);

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module);

//TODO(diegoado): use this to create advanced queries
var options = {
    withCoordinates: false, // Will provide coordinates with locations, default false
    withHashes: false,      // Will provide a 52bit geohash Integer, default false
    withDistances: false,   // Will provide distance from query, default false
    order: 'ASC',           // or 'DESC' or true (same as 'ASC'), default false
    units: 'm',             // or 'km', 'mi', 'ft', default 'm'
    count: 100,             // Number of results to return, default undefined
    accurate: false         // Useful if in emulated mode and accuracy is important, default false
};


exports.addLocalization = function(id, latitude, longitude) {
    geo.addLocation(id.toString(), {latitude: latitude, longitude: longitude}, function (err, reply) {
        if (err) {
            throw err;
        } else
            log.info('The search in point by ' + id.toString() + ' is successfully enabled');
    });
};

exports.deleteLocalization = function (id) {
    geo.removeLocation(id, function (err, reply) {
        if (err)
            throw err;
        else
            log.info('The search in point by ' + id.toString() + ' is successfully disabled')
    });
};

exports.searchNearbyLocalizations = function (latitude, longitude, distance, cb) {
    geo.nearby({ latitude: latitude, longitude: longitude}, distance, function (err, attractions) {
        cb(err, attractions);
    });
};