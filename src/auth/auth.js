var passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    LocalStrategy = require('passport-local').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    FacebookTokenStrategy = require('passport-facebook-token'),
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

// Find the src path
var src = process.cwd() + '/src/';

var config = require(src + 'helpers/conf'),
    log = require(src + 'helpers/log')(module);

var User = require(src + 'models/user'),
    Client = require(src + 'models/client'),
    AccessToken = require(src + 'models/accessToken');


passport.use(new LocalStrategy(
    function(username, password, done) {
        var message;
        User.findOne( {$or: [{ username: username }, { email: username }]}, '+hashedPassword +salt', function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done({status: 404, code: 'user_error', message: 'User not found with username or email: ' + username}, false);
            }
            if (!user.checkPassword(password)) {
                return done({status: 401, code: 'user_error', message: 'Incorrect password'}, false);
            }
            return done(null, user);
        });
    }
));

passport.use(new BasicStrategy(
    function(clientId, clientSecret, done) {
        Client.findOne({ clientId: clientId }, function(err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done({status: 404, code: 'user_error', message: 'Client not found with clientId: ' + clientId}, false);
            }
            if (client.clientSecret !== clientSecret) {
                return done({status: 401, code: 'user_error', message: 'Incorrect client key'}, false);
            }
            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        Client.findOne({ clientId: clientId }, function(err, client) {
            var message;
            if (err) {
                return done(err);
            }
            if (!client) {
                return done({status: 404, code: 'user_error', message: 'Client not found with clientId: ' + clientId}, false);
            }
            if (client.clientSecret !== clientSecret) {
                return done({status: 401, code: 'user_error', message: 'Incorrect client key'}, false);
            }
            return done(null, client);
        });
    }
));

//TODO(diegoado): Apply new error handler strategy
passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessToken.findOne({ token: accessToken }, function(err, token) {
            if (err) {
                return done(err);
            }
            if (!token) {
                return done(null, false);
            }
            if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife') ) {

                AccessToken.remove({ token: accessToken }, function (err) {
                    if (err) {
                        return done(err);
                    }
                });
                return done(null, false, { message: 'Token expired' });
            }
            User.findById(token.userId, function(err, user) {

                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Unknown user' });
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

        User.findOrCreate({ facebookId: profile.id },
            {username: username, email: email, photo_url: photo_url, socialAuth: true}, function (err, user) {

            if (!err) {
                AccessToken.remove({ $or: [{ userId: user.userId }, { userId: profile.id }] });

                var token = new AccessToken(
                    {userId: profile.id, clientId: config.get('default:client:clientId'), token: accessToken}
                );
                token.save();
                return done(null, user);
            }
            return done(err, user);
        });
    }
));