var express = require('express'),
    passport = require('passport'),
    router = express.Router();

var src = process.cwd() + '/src/',
    log = require(src + 'log')(module),
    oauth2 = require(src + 'auth/oauth2');

router.post('/', oauth2.token);

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