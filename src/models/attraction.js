var mongoose = require('mongoose'),
    _ = require("underscore"),
    validator = require('mongoose-validator'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

// Load Models
var Point = require(src + 'models/point'),
    Photo = require(src + 'models/photo');

// Custom validator functions
validator.extend('chkArr', function (arr) { return arr.length >= 1 && arr.length <= 10 }, 'Array size is invalid');

var Attraction = Point.schema.extend({
    category: {
        type: String,
        enum: [
            'beaches', 'island resorts', 'parks', 'forests', 'monuments', 'temples', 'zoos', 'aquariums', 'museums',
            'art galleries', 'botanical gardens', 'castles', 'libraries', 'prisons', 'skyscrapers', 'bridges'
        ]
    },

    photos: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Photo'
        }],
        validate: validator({
            validator: 'chkArr', message: 'Tourist attractions must have at least one photo and in the picture 10 photos!'
        }),
        required: true,
        exists: true
    },

    approved: {
        type: Boolean,
        select: false,
        default: false
    }
});

Attraction.virtual('state')
    .get(function () {
        return this.approved ? 'Approval' : 'In Approval';
});

Attraction.methods.toJSON = function () {
    return {
        _id         : this._id,
        _type       : this._type,
        name        : this.name,
        category    : this.category,
        description : this.description,
        localization: this.localization,
        photos      : this.photos,
        state       : this.state
    }
};

Attraction.methods.toSortJSON = function () {
    var photos = [];
    _.each(this.photos, function (photo) {
        photos.push(photo._id)
    });

    return {
        _id         : this._id,
        _type       : this._type,
        name        : this.name,
        category    : this.category,
        description : this.description,
        localization: this.localization,
        photos      : photos,
        state       : this.state
    }
};

// Register cascading actions
Attraction.post('remove', function (attraction) {
    Photo.find({ _id: { $in: attraction.photos }}, function (err, photos) {
        if (err) {
            log.warn('Fail to remove attraction photos with ids: ' + attraction.photos);
        } else {
            _.each(photos, function (photo) {
                photo.remove();
            })
        }
    }).exec();
});


module.exports = mongoose.model('Attraction', Attraction);