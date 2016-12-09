var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    crypto = require('crypto');

var src = process.cwd() + '/src/',
    config = require(src + 'conf'),
    db = require(src + 'db/mongoose');
    log = require(src + 'log')(module);

// Load Models
var User = require(src + 'models/user'),
    AccessToken = require(src + 'models/accessToken'),
    RefreshToken = require(src + 'models/refreshToken');

// Create OAuth 2.0 server
var authServer = oauth2orize.createServer();

// Generic error handler
var errFn = function (cb, err) {
    if (err) {
        return cb(err);
    }
};

// Destroys any old tokens and generates a new access and refresh token
var generateTokens = function (data, done) {

    // curries in `done` callback so we don't need to pass it
    var errorHandler = errFn.bind(undefined, done),
        refreshToken,
        refreshTokenValue,
        token,
        tokenValue;

    RefreshToken.remove(data, errorHandler);
    AccessToken.remove(data, errorHandler);

    tokenValue = crypto.randomBytes(32).toString('hex');
    refreshTokenValue = crypto.randomBytes(32).toString('hex');

    data.token = tokenValue;
    token = new AccessToken(data);

    data.token = refreshTokenValue;
    refreshToken = new RefreshToken(data);

    refreshToken.save(errorHandler);

    token.save(function (err) {
        if (err) {

            log.error(err);
            return done(err);
        }

        done(null, tokenValue, refreshTokenValue, {
            'expires_in': config.get('security:tokenLife')
        });
    });
};

// Exchange username & password for access token.
authServer.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {

    User.findOne({ username: username }, function(err, user) {

        if (err) {
            return done(err);
        }

        if (!user || !user.checkPassword(password)) {
            return done(null, false);
        }

        var model = {
            userId: user.userId,
            clientId: client.clientId
        };

        generateTokens(model, done);
    });
}));

// Exchange refreshToken for access token.
authServer.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {

    RefreshToken.findOne({ token: refreshToken, clientId: client.clientId }, function(err, token) {
        if (err) {
            return done(err);
        }

        if (!token) {
            return done(null, false);
        }

        User.findById(token.userId, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            var model = {
                userId: user.userId,
                clientId: client.clientId
            };

            generateTokens(model, done);
        });
    });
}));

/* Token endpoint
 *
 * Token middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request. Clients must
 * authenticate when making requests to this endpoint.
 */

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    authServer.token(),
    authServer.errorHandler()
];