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
    AccessToken.findOne({userId: req.user}, function (err, token) {
        if (err) {
            return error.genericErrorHandler(res, err.status, err.code, err.message);
        }
        token.remove(function (err) {
            if (!err) {
                return res.json({
                    status: 'ok', message: 'User logout completed with success!'});
            } else {
                return error.genericErrorHandler(res, err.status, err.code, err.message);
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
                return error.genericErrorHandler(res, 401, err.code, err.message);
            }
            if (!user) {
                return error.genericErrorHandler(res, 400, 'user_error', info.message || 'Invalid Access Token');
            }
            res.statusCode = 200;
            return res.json({
                status: 'ok', message: 'User authentication by Facebook completed with success'});
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