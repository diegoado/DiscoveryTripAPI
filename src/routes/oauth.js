var express = require('express'),
    passport = require('passport'),
    router = express.Router();

var src = process.cwd() + '/src/',
    log = require(src + 'log')(module),
    oauth2 = require(src + 'auth/oauth2');

// Load Models for user in call routes
var AccessToken = require(src + 'models/accessToken');

router.post('/login', oauth2.token);

router.delete('/logout', passport.authenticate('bearer', { session: false }), function (req, res) {
    var userId = req.user.userId;

    AccessToken.findOne({userId: userId}, function (err, token) {
        if (err) {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);

            res.json({status: 'error', message: 'Internal Server Error'});
        }
        token.remove(function (err) {
            if (!err) {
                return res.json({status: 'ok', message: 'User logout completed with success!'});
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s', res.statusCode, err.message);

                return res.json({status: 'error', message: 'Internal Server Error'});
            }
        });
    });
});

// TODO: Provider facebook authentication
// router.post('/facebook', passport.authenticate('facebook-token'), function (req, res) {
//     if (req.user) {
//         res.statusCode = 200;
//         res.json({status: 'ok'});
//     } else {
//         res.statusCode = 401;
//         res.json({status: 'error'});
//     }
// });

module.exports = router;