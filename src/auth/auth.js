var passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    FacebookTokenStrategy = require('passport-facebook-token'),
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

var src = process.cwd() + '/src/', // Find the src path,
    config = require(src + 'conf');

var User = require(src + 'models/user'),
    Client = require(src + 'models/client'),
    AccessToken = require(src + 'models/accessToken');

passport.use(new BasicStrategy(
    function(username, password, done) {
        Client.findOne({ clientId: username }, function(err, client) {
            if (err) {
                return done(err);
            }

            if (!client) {
                return done(null, false);
            }

            if (client.clientSecret !== password) {
                return done(null, false);
            }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        Client.findOne({ clientId: clientId }, function(err, client) {
            if (err) {
                return done(err);
            }

            if (!client) {
                return done(null, false);
            }

            if (client.clientSecret !== clientSecret) {
                return done(null, false);
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

// TODO: Provider facebook authentication
passport.use(new FacebookTokenStrategy(
    config.get('auth:facebook'),
    function (accessToken, refreshToken, profile, done) {
        User.findOne({ 'facebookId': profile.id }, function (err, user) {

            if (err) {
                return done(err);
            }

            if (user) {
                return done(null, user);
            } else {
                var newUser = new User();
                return done(null, newUser);
            }
        })
    }
));