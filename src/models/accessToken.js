var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var src = process.cwd() + '/src/',
    RefreshToken = require(src + 'models/refreshToken');

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
}, {
    versionKey: false
});

AccessToken.post('remove', function (accessToken) {
    RefreshToken.remove({userId: accessToken.userId}).exec();
});

module.exports  = mongoose.model('AccessToken', AccessToken);
