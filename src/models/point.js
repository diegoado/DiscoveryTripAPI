var mongoose = require('mongoose'),
    exists = require('mongoose-exists'),
    Schema = mongoose.Schema;


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

PointSchema.plugin(exists);


module.exports =  mongoose.model('Point', PointSchema);