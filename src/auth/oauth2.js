var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    crypto = require('crypto');

// Find project working directory
var src = process.cwd() + '/src/';

var db = require(src + 'db/mongoose'),
    config = require(src + 'helpers/conf'),
    log = require(src + 'helpers/log')(module),
    errHandler = require(src + 'helpers/error');

// Load Models
var User = require(src + 'models/user'),
    AccessToken = require(src + 'models/accessToken'),
    RefreshToken = require(src + 'models/refreshToken');

// Create OAuth 2.0 server
var authServer = oauth2orize.createServer();

// Destroys any old tokens and generates a new access and refresh token
var generateTokens = function (data, done) {
    // Curries in `done` callback so we don't need to pass it
    var errorHandler = errHandler.genericErrFn.bind(undefined, done),
        refreshToken,
        refreshTokenValue,
        accessToken,
        accessTokenValue;

    // Remove all old tokens associated with data.userId
    RefreshToken.remove(data, errorHandler);
    AccessToken .remove(data, errorHandler);

    accessTokenValue  = crypto.randomBytes(32).toString('hex');
    refreshTokenValue = crypto.randomBytes(32).toString('hex');

    data.token  = accessTokenValue;
    accessToken = new AccessToken(data);

    data.token   = refreshTokenValue;
    refreshToken = new RefreshToken(data);

    accessToken.save(function (err) {
        if (err) {
            log.error(err);
            return done(err);
        }
        refreshToken.save(errorHandler);

        done(null, accessTokenValue, refreshTokenValue, {
            'expires_in': config.get('security:tokenLife')
        });
    });
};

// Exchange username & password for access token.
authServer.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    User.findOne({ $or: [{ username: username }, { email: username }] }, '+hashedPassword +salt', function(err, user) {
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