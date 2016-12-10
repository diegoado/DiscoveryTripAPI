var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/* RefreshToken: another type of token allows you to request a new bearer-token
 * without re-request a password from the user.
 **/
var RefreshToken = new Schema({
    userId: {
        type: String,
        required: true
    },

    clientId: {
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