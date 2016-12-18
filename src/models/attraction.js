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
    Image = require(src + 'models/image'),
    Localization = require(src + 'models/localization');

var Attractions = new Schema({
    userOwner: {
        type: Schema.ObjectId,
        ref: User,
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
        type: Schema.ObjectId,
        ref: Localization,
        require: true
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

Attractions.virtual('state')
    .get(function () {
        return this.approved ? 'Approval' : 'In Approval';
});

Attractions.post('save', function (attraction) {
    Localization.findById(attraction.localization, function (err, loc) {
        if (!err && loc) {
            geocoder.reverse({ lat: loc.latitude, lon: loc.longitude }, function (err, address) {
                if (err) {
                    log.warn('Cannot find tourist attraction address. Error caused by: %s', err.message);
                } else {
                    if (address.length > 1) {
                        log.info(
                            "Get multiples address for tourist attraction coordinates, getting address at first position"
                        );
                    }
                    loc.city         = address[0].city;
                    loc.streetName   = address[0].streetName;
                    loc.streetNumber = address[0].streetNumber;
                    loc.zipcode      = address[0].zipcode;
                    loc.country      = address[0].country;
                    loc.countryCode  = address[0].countryCode;

                    loc.save(function (err) {
                        if (err) {
                            log.warn('Cannot save the tourist attraction address');
                        }
                    });
                }
            });
        }
    }).exec();
});

module.exports = mongoose.model('Attraction', Attractions);