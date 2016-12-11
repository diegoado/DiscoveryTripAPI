var mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate'),
    Schema = mongoose.Schema;

/* Client: A application which requests access on behalf of a user.
 *
 * A client has a name and a secret code.
 **/
var Client = new Schema({
    name: {
        type: String,
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

Client.plugin(findOrCreate);

module.exports = mongoose.model('Client', Client);