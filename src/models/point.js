var mongoose = require('mongoose'),
    exists = require('mongoose-exists'),
    NodeGeocoder = require('node-geocoder'),
    Schema = mongoose.Schema;


// Find project working directory
var src = process.cwd() + '/src/';

var config = require(src + 'helpers/conf'),
    log = require(src + 'helpers/log')(module);


// Load Models
var Localization = require(src + 'models/localization');

// Get NodeGeocode using as provider the Google
var geocoder = NodeGeocoder({
    provider: 'google',
    clientID: config.get('auth:google:clientID'), apiKey: config.get('auth:google:apiKey')
});

var PointSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        exists: true
    },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    localization: {
        type: Schema.Types.ObjectId,
        ref: 'Localization',
        required: true,
        exists: true
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
    versionKey: false,
    collection: 'points',
    discriminatorKey: '_type'
});

// Register cascading actions
PointSchema.post('remove', function (point) {
    Localization.findByIdAndRemove(point.localization, function (err, localization) {
        if (err) {
            log.warn('Fail to remove point localization with id: ' + point.localization);
        }
    }).exec();
});

PointSchema.post('save', function (point) {
    Localization.findById(point.localization, function (err, localization) {
        if (err) {

        } else {
            geocoder.reverse({lat: localization.latitude, lon: localization.longitude}, function (err, addr) {
                if (err) {
                    log.warn('Cannot find tourist attraction address. Error caused by: %s', err.message);
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
                    Localization.update({_id: localization._id}, { $set: address}, function (err) {
                        if (err) {
                            log.warn('Cannot save the tourist attraction address');
                        }
                    });
                }
            });
        }
    }).exec();
});

PointSchema.plugin(exists);


module.exports =  mongoose.model('Point', PointSchema);