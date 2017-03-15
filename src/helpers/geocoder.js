// Initialize geo services
var nodeGeocoder = require('node-geocoder');


// Find project working directory
var src = process.cwd() + '/src/';

var config = require(src + 'helpers/conf'),
    log = require(src + 'helpers/log')(module);

// Get nodeGeocoder using as Google as provider
var googleGeocoder = nodeGeocoder({
    provider: 'google',
    clientID: config.get('auth:google:clientID'), apiKey: config.get('auth:google:apiKey')
});

var hereGeocoder = nodeGeocoder({
    provider: 'here',
    appId: config.get('auth:here:appId'), appCode: config.get('auth:here:appCode')
});

function localizationDecoder(geocoder, latitude, longitude, cb) {
    geocoder.reverse({lat: latitude, lon: longitude}, function (err, addr) {
        if (err) {
            cb(err, null);
        } else {
            if (addr.length > 1) {
                log.info("Get multiples address for point coordinates, setting address at first position");
            }
            var address = {
                city        : addr[0].city,
                streetName  : addr[0].streetName,
                streetNumber: addr[0].streetNumber,
                zipcode     : addr[0].zipcode,
                country     : addr[0].country,
                countryCode : addr[0].countryCode
            };
            cb(null, address);
        }
    });
}

exports.localizationDecoder = function (latitude, longitude, cb) {
    localizationDecoder(googleGeocoder, latitude, longitude, function (err, address) {
        if (err)
            localizationDecoder(hereGeocoder, latitude, longitude, cb);
        else
            cb(err, address);
    })
};