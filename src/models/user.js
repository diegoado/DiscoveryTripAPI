var mongoose = require('mongoose'),
    validator = require('mongoose-validator'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

/* User: Who factor uses the mobile application.
 *
 * A user is who has a name, password hash and a salt.
 **/
var User = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        validate: validator({validator: 'isEmail', message: 'Invalid Email Address'})
    },

    facebookId: {
        type: String,
        select: false
    },

    photo_url: {
        type: String,
        validate: validator({validator: 'isURL', passIfEmpty: true, message: 'Invalid Photo Url'})
    },

    hashedPassword: {
        type: String,
        required: true,
        select: false
    },

    salt: {
        type: String,
        required: true,
        select: false
    },

    created: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

User.virtual('userId')
    .get(function () {
        return this.id;
    });

User.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(32).toString('hex');
        // More secure
        // this.salt = crypto.randomBytes(128).toString('hex');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });


User.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    // More secure
    // return crypto.pbkdf2Sync(password, this.salt, 10000, 512).toString('hex');
};

User.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

module.exports = mongoose.model('User', User);