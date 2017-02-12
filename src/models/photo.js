var mongoose = require('mongoose'),
    validator = require('mongoose-validator'),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

var config = require(src + 'helpers/conf');

// Custom validator functions
validator.extend('chkSize', function (val) { return val <= 5242880 }, 'Size is too large');


var Photo = new Schema({
    name: {
        type: String,
        required: true
    },

    data: {
        type: Buffer,
        required: true
    },

    size: {
        type: Number,
        required: true
        // validate: validator({ validator: 'chkSize', message: 'The Photo size is too large!' })
    },

    mimetype: {
        type: String,
        required: true,
        enum: config.get('images:mimetype')
    },

    encoding: {
        type: String,
        required: true
    }

}, {
    versionKey: false
});


module.exports = mongoose.model('Photo', Photo);