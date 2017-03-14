var mongoose = require('mongoose'),
    validator = require('mongoose-validator'),
    Schema = mongoose.Schema;


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

// Remove longitude and latitude restriction
// Localization.index({longitude: 1, latitude: 1}, {unique: true});

module.exports = mongoose.model('Localization', Localization);
