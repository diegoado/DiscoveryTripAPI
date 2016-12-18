var mongoose = require('mongoose'),
    validator = require('mongoose-validator'),
    Schema = mongoose.Schema;


var Image = new Schema({

    ownerId: {
        type: String,
        require: true
    }

}, {
    versionKey: false
});

module.exports = mongoose.model('Image', Image);