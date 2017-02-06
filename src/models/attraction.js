var mongoose = require('mongoose'),
    NodeGeocoder = require('node-geocoder'),
    validator = require('mongoose-validator'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module);

// Get NodeGeocode using as provider the Google
var geocoder = NodeGeocoder({provider: 'google'});

// Load Models
var User = require(src + 'models/user'),
    Photo = require(src + 'models/photo');

// Custom validator functions
validator.extend('chkArr', function (arr) { return arr.length >= 1 && arr.length <= 10 }, 'Array size is invalid');

var Attraction = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: User.schemaName,
        required: true
    },

    name: {
        type: String,
        unique: true,
        required: true
    },

    description: {
        type: String,
        required: true
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
            required: true,
            validate: validator({
                validator: 'matches',
                arguments: /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/i,
                message: 'Invalid Longitude matches'
            })
        },

        latitude: {
            type: String,
            required: true,
            validate: validator({
                validator: 'matches',
                arguments: /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/i,
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
    },

    photos: {
        type: [{
            type: Schema.ObjectId,
            ref: Photo.schemaName
        }],
        required: true,
        validate: validator({
            validator: 'chkArr',
            message: 'Tourist attractions must have at least one photo and in the picture 10 photos!'
        })
    },

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

Attraction.methods.toJSON = function () {
    return {
        name        : this.name,
        description : this.description,
        localization: this.localization,
        state       : this.state,
        created     : this.created
    }
};

Attraction.plugin(deepPopulate, {
    populate: {
        'photos': {
            select: 'name'
        }
    }
});

module.exports = mongoose.model('Attraction', Attraction);