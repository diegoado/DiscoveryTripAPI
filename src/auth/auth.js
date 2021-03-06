var passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    LocalStrategy = require('passport-local').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    GoogleTokenStrategy = require('passport-google-id-token'),
    FacebookTokenStrategy = require('passport-facebook-token'),
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

// Find the src path
var src = process.cwd() + '/src/';

var config = require(src + 'helpers/conf');

var User = require(src + 'models/user'),
    Client = require(src + 'models/client'),
    AccessToken = require(src + 'models/accessToken');


passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne( {$or: [{ username: username }, { email: username }]}, function (err, user) {
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
            return done(null, user);
        });
    }
));

passport.use(new BasicStrategy(
    function(clientId, clientSecret, done) {
        Client.findOne({ applicationId: clientId }, function(err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(
                    { status: 404, code: 'user_error', message: 'Client not found with applicationId: ' + clientId },
                    false
                );
            }
            if (client.applicationKey !== clientSecret) {
                return done({status: 401, code: 'user_error', message: 'Incorrect client key'}, false);
            }
            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        Client.findOne({ applicationId: clientId }, function(err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(
                    { status: 404, code: 'user_error', message: 'Client not found with applicationId: ' + clientId },
                    false
                );
            }
            if (client.applicationKey !== clientSecret) {
                return done({ status: 401, code: 'user_error', message: 'Incorrect client key' }, false);
            }
            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessToken.findOne({ token: accessToken }, function(err, token) {
            if (err) {
                return done(err);
            }
            if (!token) {
                return done({ status: 401, code: 'user_error', message: 'Invalid Access Token' }, false);
            }
            if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife') ) {

                token.remove(function (err) {
                    if (err) {
                        return done(err);
                    }
                });
                return done({ status: 401, code: 'user_error', message: 'Access Token expired' }, false);
            }
            User.findById(token.userId, function(err, user) {

                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done({ status: 404, code: 'user_error' , message: 'User not found' }, false);
                }
                done(null, user, { scope: '*' });
            });
        });
    }
));

passport.use(new FacebookTokenStrategy(config.get('auth:facebook'),
    function (accessToken, refreshToken, profile, done) {
        var email     = profile.emails[0].value,
            photo_url = profile.photos[0].value,
            username  = profile._json.link.split('/').slice(-1)[0] || profile.displayName;

        User.findOrCreate({ socialId: profile.id },
            { username: username, email: email, photo_url: photo_url, socialAuth: true }, function (err, user) {

            if (!err) {
                AccessToken.remove({ userId: user });

                var token = new AccessToken(
                    {userId: user, applicationId: config.get('default:client:applicationId'), token: accessToken}
                );
                token.save();
                return done(null, user);
            }
            return done(err, user);
        });
    }
));

//TODO(diegoado): Implement this Strategy
passport.use(new GoogleTokenStrategy(config.get('auth:google'),
    function(parsedToken, googleId, done) {
        User.findOrCreate({ socialId: googleId }, function (err, user) {
            return done(err, user);
        });
    }
));