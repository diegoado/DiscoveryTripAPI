var express = require('express'),
    passport = require('passport'),
    router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var oauth2 = require(src + 'auth/oauth2'),
    log = require(src + 'helpers/log')(module),
    errorHandler = require(src + 'helpers/error');

// Load Models
var AccessToken = require(src + 'models/accessToken');

router.post('/login', oauth2.token);

router.delete('/logout', passport.authenticate('bearer', { session: false }), function (req, res) {
    var userId = req.user.userId;

    AccessToken.findOne({userId: userId}, function (err, token) {
        if (err) {
            return errorHandler.internalError(err, res);
        }
        token.remove(function (err) {
            if (!err) {
                var message = 'User logout completed with success!';
                log.info(message);

                return res.json({status: 'ok', message: message});
            } else {
                return errorHandler.internalError(err, res);
            }
        });
    });
});

// TODO: Provider facebook authentication
// router.post('/facebook/login', passport.authenticate('facebook-token'), function (req, res) {
//     if (req.user) {
//         res.statusCode = 200;
//         res.json({status: 'ok'});
//     } else {
//         res.statusCode = 401;
//         res.json({status: 'errorHandler'});
//     }
// });

module.exports = router;