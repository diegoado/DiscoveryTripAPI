var mongoose = require('mongoose'),
    exists = require('mongoose-exists'),
    Schema = mongoose.Schema;


// Find project working directory
var src = process.cwd() + '/src/';

var config = require(src + 'helpers/conf'),
    log = require(src + 'helpers/log')(module),
    geocoder = require(src + 'helpers/geocoder');

// Load Models
var Localization = require(src + 'models/localization');

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

PointSchema.methods.toJSON = function () {
    var jsonObj = {
        _id         : this._id,
        _type       : this._type,
        name        : this.name,
        description : this.description,
        localization: this.localization
    };

    if (this._type === 'Event') {
        jsonObj.photo    = this.photo ? this.photo._id : null;
        jsonObj.kind     = this.kind;
        jsonObj.price    = this.price;
        jsonObj.keywords = this.keywords;
    } else {
        jsonObj.photos = this.photos;
        jsonObj.state  = this.state;
    }
    jsonObj.startDate = this.startDate;
    jsonObj.endDate   = this.endDate;
    
    return jsonObj;
};

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
            log.warn('Fail to find point localization with id: ' + point.localization);
        } else {
            geocoder.localizationDecoder(localization.latitude, localization.longitude, function (err, addr) {
                if (err) {
                    log.warn('Cannot find point address. Error caused by: %s', err.message);
                } else {
                    Localization.update({_id: localization._id}, { $set: addr}, function (err) {
                        if (err) {
                            log.warn('Cannot update the point address');
                        }
                    });
                }
            });
        }
    }).exec();
});

PointSchema.plugin(exists);


module.exports =  mongoose.model('Point', PointSchema);