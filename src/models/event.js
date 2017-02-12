var mongoose = require('mongoose'),
    validator = require('mongoose-validator'),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module);

// Load Models
var User = require(src + 'models/user'),
    Photo = require(src + 'models/photo');

// Custom validator functions
validator.extend('chkDates', function (inputDate) { return this.startDate < inputDate }, 'Invalid input date');


var Event = new Schema({
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

    guests: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },

    photo: {
        type: Schema.Types.ObjectId,
        ref: 'Photo'
    },

    kind: {
        type: String,
        enum: ['public', 'private'],
        required: true,
        default: 'public'
    },

    price: {
        type: String,
        default: '0',
        validate: validator({validator: 'isNumeric', message: 'Invalid Event Price'})
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

Event.methods.toJSON = function () {
    return {
        name        : this.name,
        description : this.description,
        attraction  : this.attraction,
        photo       : this.photo,
        kind        : this.kind,
        price       : this.price,
        keywords    : this.keywords,
        startDate   : this.startDate,
        endDate     : this.endDate,
        created     : this.created
    }
};


module.exports = mongoose.model('Event', Event);