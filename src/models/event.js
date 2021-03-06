var mongoose = require('mongoose'),
    validator = require('mongoose-validator'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module);

// Load Models
var Point = require(src + 'models/point'),
    Photo = require(src + 'models/photo');

// Custom validator functions
validator.extend('chkDates', function (date) { return this.startDate < date }, 'Invalid input date');


var Event = Point.schema.extend({
    interested: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        exists: true
    },

    photo: {
        type: Schema.Types.ObjectId,
        ref: 'Photo',
        exists: true
    },

    kind: {
        type: String,
        enum: ['public', 'private'],
        required: true,
        default: 'public'
    },

    price: {
        type: String,
        validate: validator({
            validator: 'isFloat', arguments: { min: 0 }, passIfEmpty: true, message: 'Invalid Event Price'
        })
    },

    keywords: {
        type: [String]
    },

    startDate: {
        type: Date,
        required: true,
        default: Date.now()
    },

    endDate: {
        type: Date,
        required: true,
        validate: validator({ validator: 'chkDates', message: 'End date must be after start date'})
    }
});

Event.methods.toJSON = function () {
    return {
        _id         : this._id,
        _type       : this._type,
        name        : this.name,
        description : this.description,
        localization: this.localization,
        photo       : this.photo ? this.photo : null,
        kind        : this.kind,
        price       : this.price,
        keywords    : this.keywords,
        startDate   : this.startDate,
        endDate     : this.endDate
    }
};

Event.methods.toSortJSON = function () {
    var photo = this.photo ? this.photo._id : null;

    return {
        _id         : this._id,
        _type       : this._type,
        name        : this.name,
        description : this.description,
        localization: this.localization,
        photo       : photo,
        kind        : this.kind,
        price       : this.price,
        keywords    : this.keywords,
        startDate   : this.startDate,
        endDate     : this.endDate
    }
};

// Register cascading actions
Event.post('remove', function (event) {
    Photo.findByIdAndRemove(event.photo, function (err, photo) {
        if (err) {
            log.warn('Fail to remove event photo with id: ' + event.photo);
        }
    }).exec();
});


module.exports = mongoose.model('Event', Event);