var express = require('express'),
    passport = require('passport'),
    router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var oauth2 = require(src + 'auth/oauth2'),
    error = require(src + 'helpers/error'),
    mailer = require(src + 'helpers/mailer'),
    log = require(src + 'helpers/log')(module);

// Load Models
var AccessToken = require(src + 'models/accessToken'),
    User = require(src + 'models/user');

router.post('/login', oauth2.token);

router.post('/login/pwd_reminder', function (req, res) {
    User.findOne({ email: req.body.email.toLowerCase() }, function (err, user) {

        if (err) {
            return error.genericErrorHandler(res, err.status, err.code, err.message);
        } else if (!user) {
            return error.genericErrorHandler(res, 404, 'User not found!');
        } else if (user.socialAuth) {
            return error.genericErrorHandler(res, 400, 'user_error', 'Service available only for local users');
        } else  {
            mailer.isRunning().then(function () {
                    return mailer.sendPwdReminder(res, user);
                }).catch(function (err) {
                    return error.genericErrorHandler(res, err.statusCode, 'server_error', err.message);
                });
        }
    })
});

router.delete('/logout', passport.authenticate('bearer', { session: false }), function (req, res) {
    AccessToken.findOne({userId: req.user}, function (err, token) {
        if (err) {
            return error.genericErrorHandler(res, err.status, err.code, err.message);
        } else {
            token.remove(function (err) {
                if (!err) {
                    var message = 'User logout completed with success!';

                    log.info(message);
                    return res.json({ status: 'ok', message: 'User logout completed with success!' });
                } else {
                    return error.genericErrorHandler(res, err.status, err.code, err.message);
                }
            });
        }
    });
});

router.post('/facebook/login', function(req, res, next) {
    passport.authenticate('facebook-token', { session: false, failWithError: true },
        function (err, user, info) {
            if (err) {
                if (err.name === 'ValidationError') {
                    return error.invalidFieldError(err, res);
                } else {
                    return error.genericErrorHandler(res, 401, err.code, err.message);
                }
            } else if (!user) {
                return error.genericErrorHandler(res, 400, 'user_error', info.message || 'Invalid Access Token');
            } else {
                var message = 'User authentication by Facebook completed with success!';

                log.info(message);
                return res.json({ status: 'ok', message: message });
            }
        }
    )(req, res, next)
});

router.post('/google/login',
    passport.authenticate('google-id-token', { session: false, failWithError: true }),
    function (req, res) {
        res.send(req.user? 200 : 401);
    }
);

module.exports = router;