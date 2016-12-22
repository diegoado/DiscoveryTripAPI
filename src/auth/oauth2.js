var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    crypto = require('crypto');

// Find project working directory
var src = process.cwd() + '/src/';

var db = require(src + 'db/mongoose'),
    config = require(src + 'helpers/conf'),
    log = require(src + 'helpers/log')(module),
    error = require(src + 'helpers/error');

// Load Models
var User = require(src + 'models/user'),
    AccessToken = require(src + 'models/accessToken'),
    RefreshToken = require(src + 'models/refreshToken');

// Create OAuth 2.0 server
var authServer = oauth2orize.createServer();

// Destroys any old tokens and generates a new access and refresh token
var generateTokens = function (data, done) {
    // Curries in `done` callback so we don't need to pass it
    var errorHandler = error.genericErrFn.bind(undefined, done),
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
            return done(err);
        }
        refreshToken.save(errorHandler);

        var message = 'Access Token acquired with success!',
            info = {expires_in: config.get('security:tokenLife'), message: message, status: 'ok'};

        log.info(message);
        done(null, accessTokenValue, refreshTokenValue, info);
    });
};

// Exchange username & password for access token by basic strategy.
authServer.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    User.findOne({ $or: [{ username: username }, { email: username }] }, '+hashedPassword +salt', function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(
                { status: 404, code: 'user_error', message: 'User not found with username or email: ' + username },
                false
            );
        }
        if (!user.checkPassword(password)) {
            return done({ status: 401, code: 'user_error', message: 'Incorrect password' }, false);
        }
        generateTokens({ userId: user, applicationId: client.applicationId }, done);
    });
}));

// Exchange username & password for access token by local strategy.
authServer.exchange(oauth2orize.exchange.clientCredentials(function(user, scope, done) {
    generateTokens({ userId: user, applicationId: config.get('default:client:applicationId') }, done);
}));

// Exchange refreshToken for access token.
authServer.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
    RefreshToken.findOne({ token: refreshToken, applicationId: client.applicationId }, function(err, token) {
        if (err) {
            return done(err);
        }
        if (!token) {
            return done({ status: 401, code: 'user_error', message: 'Invalid Refresh Token' }, false);
        }
        User.findById(token.userId, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done({ status: 404, code: 'user_error' , message: 'User not found' }, false);
            }
            generateTokens({ userId: user, applicationId: client.applicationId }, done);
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
    passport.authenticate(['local', 'oauth2-client-password'], { session: false, failWithError: true }),
    authServer.token(),
    authServer.errorHandler({mode: 'indirect'})
];