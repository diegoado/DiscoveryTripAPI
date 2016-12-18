var mongoose = require('mongoose'),
    NodeGeocoder = require('node-geocoder'),
    validator = require('mongoose-validator'),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module);

// Get NodeGeocode using as provider the Google
var geocoder = NodeGeocoder({provider: 'google'});

// Custom validator function
validator.extend('isNotEmpty', function (arr) { return arr.length >= 1 }, 'Array can not be empty');

// Load Models
var User = require(src + 'models/user'),
    Image = require(src + 'models/image');

var Attraction = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: User.schemaName,
        required: true
    },

    name: {
        type: String,
        unique: true,
        require: true
    },

    description: {
        type: String,
        require: true
    },

    category: {
        type: String,
        enum: [
            'beaches', 'island resorts', 'parks', 'forests', 'monuments', 'temples', 'zoos', 'aquariums', 'museums',
            'art galleries', 'botanical gardens', 'castles', 'libraries', 'prisons', 'skyscrapers', 'bridges'
        ]
    },

    localization: {

        longitude: {
            type: String,
            require: true,
            validate: validator({
                validator: 'matches',
                arguments: /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/i,
                message: 'Invalid Longitude matches'
            })
        },

        latitude: {
            type: String,
            require: true,
            validate: validator({
                validator: 'matches',
                arguments: /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/i,
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
    },

    // images: [{
    //     type: Schema.ObjectId,
    //     ref: Image,
    //     require: true,
    //     validate: validator({validator: 'isNotEmpty', message: 'Tourist attractions must have at least one photo.'})
    // }],

    approved: {
        type: Boolean,
        select: false,
        default: false
    },

    created: {
        type: Date,
        default: Date.now
    },

    updated: {
        type: Date,
        select: false,
        default: Date.now
    }

}, {
    versionKey: false
});

Attraction.index({localization: {longitude: 1, latitude: 1}}, {unique: true});

Attraction.virtual('state')
    .get(function () {
        return this.approved ? 'Approval' : 'In Approval';
});

Attraction.post('save', function (att) {
    geocoder.reverse({lat: att.localization.latitude, lon: att.localization.longitude}, function (err, address) {
        if (err) {
            log.warn('Cannot find tourist attraction address. Error caused by: %s', err.message);
        } else {
            if (address.length > 1) {
                log.info("Get multiples address for tourist attraction coordinates, getting address at first position");
            }
            att.localization.city = address[0].city;
            att.localization.streetName = address[0].streetName;
            att.localization.streetNumber = address[0].streetNumber;
            att.localization.zipcode = address[0].zipcode;
            att.localization.country = address[0].country;
            att.localization.countryCode = address[0].countryCode;

            att.save(function (err) {
                if (err) {
                    log.warn('Cannot save the tourist attraction address');
                }
            });
        }
    });
});


module.exports = mongoose.model('Attraction', Attraction);