var mongoose = require('mongoose'),
    validator = require('mongoose-validator'),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

// Load Models
var User = require(src + 'models/user');

var Photo = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: User.schemaName,
        required: true
    }

}, {
    versionKey: false
});

module.exports = mongoose.model('Photo', Photo);