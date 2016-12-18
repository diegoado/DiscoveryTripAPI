var mongoose = require('mongoose'),
    validator = require('mongoose-validator'),
    Schema = mongoose.Schema;

var Localization = new Schema({

    longitude: {
        type: String,
        require: true,
        validator: validator({
            validator: 'matches',
            arguments: ['^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$', 'i'],
            message: 'Invalid Longitude matches'
        })
    },

    latitude: {
        type: String,
        require: true,
        validator: validator({
            validator: 'matches',
            arguments: ['^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$', 'i'],
            message: 'Invalid Latitude matches'
        })
    },

    city: {
        type: String,
        select: false
    },
    streetName: {
        type: String,
        select: false
    },

    streetNumber: {
        type: String,
        select: false
    },

    zipcode: {
        type: String,
        select: false
    },

    country: {
        type: String,
        select: false
    },

    countryCode: {
        type: String,
        select: false
    }

}, {
    versionKey: false
});

Localization.index({latitude: 1, longitude: 1}, {unique: true});

module.exports = mongoose.model('Localization', Localization);