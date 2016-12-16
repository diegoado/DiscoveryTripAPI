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

// router.post('/login', function(req, res, next){
//     passport.authenticate('local', {session: false, failWithError: true}, function(err, user, info) {
//         if (err) {
//             return next(err);
//         }
//         //authentication error
//         if (!user) { return res.json({error: info.message || 'Invalid Token'}) }
//
//         //success
//         req.logIn(user, function(err) {
//             if (err) { return next(err); }
//             return next();
//         });
//
//     })(req, res, next)
// });

// router.post('/login', passport.authenticate('local', { session: false, failWithError: true }),
//     // Handle success
//     function(req, res, next) {
//         if (req.user) {
//             return res.json({ id: req.user.id }); }
//     },
//     // Handle error
//     function(err, req, res, next) {
//         return res.json(err);
//     }
// );

router.post('/facebook/login', passport.authenticate('facebook-token', { session: false }), function (req, res) {
    if (req.user) {
        res.statusCode = 200;
        res.json({status: 'ok', message: 'User authentication by Facebook completed with success'});
    } else {
        res.statusCode = 401;
        res.send('Unauthorized');
    }
});

module.exports = router;