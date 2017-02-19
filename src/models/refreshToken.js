var mongoose = require('mongoose'),
    exists = require('mongoose-exists'),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

var User = require(src + 'models/user');

/* RefreshToken: another type of token allows you to request a new bearer-token
 * without re-request a password from the user.
 **/
var RefreshToken = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        exists: true
    },

    accessToken: {
        type: Schema.Types.ObjectId,
        ref: 'AccessToken',
        required: true,
        exists: true
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

RefreshToken.plugin(exists);


module.exports = mongoose.model('RefreshToken', RefreshToken);