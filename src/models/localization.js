var mongoose = require('mongoose'),
    NodeGeocoder = require('node-geocoder'),
    validator = require('mongoose-validator'),
    Schema = mongoose.Schema;


// Find project working directory
var src = process.cwd() + '/src/';

var config = require(src + 'helpers/conf'),
    log = require(src + 'helpers/log')(module);

// Get NodeGeocode using as provider the Google
var geocoder = NodeGeocoder({
    provider: 'google',
    clientID: config.get('auth:google:clientID'), apiKey: config.get('auth:google:apiKey')
});

var Localization = new Schema({
    longitude: {
        type: String,
        required: true,
        validate: validator({
            validator: 'matches',
            arguments: /^(\+|-)?(?:180(?:(?:\.0{1,8})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,8})?))$/i,
            message: 'Invalid Longitude matches'
        })
    },

    latitude: {
        type: String,
        required: true,
        validate: validator({
            validator: 'matches',
            arguments: /^(\+|-)?(?:90(?:(?:\.0{1,8})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,8})?))$/i,
            message: 'Invalid Latitude matches'
        })
    },

    city: {
        type: String
    },

    streetName: {
        type: String
    },

    streetNumber: {
        type: String
    },

    zipcode: {
        type: String
    },

    country: {
        type: String
    },

    countryCode: {
        type: String
    }

}, {
    versionKey: false
});

/**
Localization.post('save', function (localization) {
    geocoder.reverse({lat: localization.latitude, lon: localization.longitude}, function (err, address) {
        if (err) {
            log.warn('Cannot find tourist attraction address. Error caused by: %s', err.message);
        } else {
            if (address.length > 1) {
                log.info("Get multiples address for tourist attraction coordinates, getting address at first position");
            }
            localization.city         = address[0].city;
            localization.streetName   = address[0].streetName;
            localization.streetNumber = address[0].streetNumber;
            localization.zipcode      = address[0].zipcode;
            localization.country      = address[0].country;
            localization.countryCode  = address[0].countryCode;

            localization.save(function (err) {
                if (err) {
                    log.warn('Cannot save the tourist attraction address');
                }
            });
        }
    });
});
**/

// Remove longitude and latitude restriction
// Localization.index({longitude: 1, latitude: 1}, {unique: true});

module.exports = mongoose.model('Localization', Localization);
