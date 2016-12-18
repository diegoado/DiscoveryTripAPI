var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

var User = require(src + 'models/user');

/* RefreshToken: another type of token allows you to request a new bearer-token
 * without re-request a password from the user.
 **/
var RefreshToken = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: User.schemaName,
        required: true
    },

    applicationId: {
        type: String,
        required: true
    },

    token: {
        type: String,
        unique: true,
        required: true
    },

    created: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('RefreshToken', RefreshToken);