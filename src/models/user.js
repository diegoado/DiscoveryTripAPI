var mongoose = require('mongoose'),
    validator = require('mongoose-validator'),
    findOrCreate = require('mongoose-findorcreate'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module);

var AccessToken = require(src + 'models/accessToken');


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

    socialId: {
        type: String
    },

    photo_url: {
        type: String,
        validate: validator({validator: 'isURL', passIfEmpty: true, message: 'Invalid Photo Url'})
    },

    hashedPassword: {
        type: String
    },

    salt: {
        type: String
    },

    //TODO(diegoado): Create a method to decrypt the hashedPassword
    // _plainPassword: {
    //     type: String,
    //     select: false
    // },

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

User.virtual('socialAuth')
    .get(function () {
       return this.socialId;
    });

User.virtual('password')
    .set(function(password) {
        // this._plainPassword = password;
        this.salt = crypto.randomBytes(32).toString('hex');
        // More secure
        // this.salt = crypto.randomBytes(128).toString('hex');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this.decryptPassword(); });


User.methods.encryptPassword = function(password) {
    var cipher  = crypto.createCipher('aes-256-cbc-hmac-sha1', this.salt),
        crypted = cipher.update(password, 'utf8', 'hex');

    return crypted + cipher.final('hex');
    // More secure
    // return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    // return crypto.pbkdf2Sync(password, this.salt, 10000, 512).toString('hex');
};

User.methods.decryptPassword = function () {
    var decipher = crypto.createDecipher('aes-256-cbc-hmac-sha1', this.salt),
        dec      = decipher.update(this.hashedPassword, 'hex', 'utf8');

    return dec + decipher.final('utf8');
};

User.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

User.methods.toJSON = function () {
    return {
        id       : this.userId,
        username : this.username,
        email    : this.email,
        photo_url: this.photo_url,
        created  : this.created
    }
};

// Create indexes
User.index({socialId: 1}, {unique: true, sparse: true});

// Register cascading actions
User.post('remove', function (user) {
    AccessToken.findOne({ userId: user.userId }, function (err, token) {
        if (err) {
            log.warn('Fail to find user access token')
        } else if (token) {
            token.remove()
        }
    }).exec();
});

User.plugin(findOrCreate);

module.exports = mongoose.model('User', User);