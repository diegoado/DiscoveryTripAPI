var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/* AccessToken: token (type of bearer), issued to the client application, limited by time.
 **/
var AccessToken = new Schema({
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
});

module.exports  = mongoose.model('AccessToken', AccessToken);
