var express = require('express'),
    passport = require('passport'),
    router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var oauth2 = require(src + 'auth/oauth2'),
    error = require(src + 'helpers/error'),
    log = require(src + 'helpers/log')(module);

// Load Models
var AccessToken = require(src + 'models/accessToken');

router.post('/login', oauth2.token);

router.delete('/logout', passport.authenticate('bearer', { session: false }), function (req, res) {
    var userId = req.user.userId;

    AccessToken.findOne({userId: userId}, function (err, token) {
        if (err) {
            return error.genericErrorHandler(res, err.status, err.message);
        }
        token.remove(function (err) {
            if (!err) {
                var message = 'User logout completed with success!';

                log.info(message);
                return res.json({status: 'ok', message: message});
            } else {
                return error.genericErrorHandler(res, err.status, err.message);
            }
        });
    });
});

router.post('/facebook/login', function(req, res, next) {
    passport.authenticate('facebook-token', { session: false, failWithError: true },
        function (err, user, info) {
            if (err) {
                if (err.name == 'ValidationError') {
                    return error.invalidFieldError(err, res);
                }
                return error.genericErrorHandler(res, 401, err.message);
            }
            if (!user) {
                return error.genericErrorHandler(res, 400, info.message || 'Invalid Access Token');
            }
            res.statusCode = 200;
            return res.json({status: 'ok', message: 'User authentication by Facebook completed with success'});
        }
    )(req, res, next)
});

module.exports = router;