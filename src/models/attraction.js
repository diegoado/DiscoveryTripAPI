var mongoose = require('mongoose'),
    _ = require("underscore"),
    exists = require('mongoose-exists'),
    validator = require('mongoose-validator'),
    Schema = mongoose.Schema;


// Find project working directory
var src = process.cwd() + '/src/';

// Load Models
var User = require(src + 'models/user'),
    Photo = require(src + 'models/photo'),
    Localization = require(src + 'models/localization');

// Custom validator functions
validator.extend('chkArr', function (arr) { return arr.length >= 1 && arr.length <= 10 }, 'Array size is invalid');

var Attraction = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
        type: Schema.Types.ObjectId,
        ref: 'Localization',
        required: true,
        exists: true
    },

    photos: {
        type: [{
            type: Schema.Types.ObjectId, ref: 'Photo'
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

Attraction.virtual('state')
    .get(function () {
        return this.approved ? 'Approval' : 'In Approval';
});

Attraction.methods.toJSON = function () {
    return {
        _id         : this._id,
        name        : this.name,
        description : this.description,
        localization: this.localization,
        photos      : this.photos,
        state       : this.state,
        created     : this.created
    }
};

Attraction.methods.toSortJson = function () {
    var photos = [];
    _.each(this.photos, function (photo) {
        photos.push(photo._id)
    });

    return {
        _id         : this._id,
        name        : this.name,
        description : this.description,
        localization: this.localization,
        photos      : photos,
        state       : this.state,
        created     : this.created
    }
};

Attraction.plugin(exists);

module.exports = mongoose.model('Attraction', Attraction);