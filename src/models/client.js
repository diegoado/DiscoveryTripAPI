var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/* Client: A application which requests access on behalf of a user.
 *
 * A client has a name and a secret code.
 **/
var Client = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },

    clientId: {
        type: String,
        unique: true,
        required: true
    },

    clientSecret: {
        type: String,
        required: true
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('Client', Client);