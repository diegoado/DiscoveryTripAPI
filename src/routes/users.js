var passport = require('passport'),
    express = require('express'),
    router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module),
    error = require(src + 'helpers/error');

// Load Models
var User = require(src + 'models/user');

router.post('/', function(req, res) {
    var user = new User({
        username : req.body.username,
        password : req.body.password,
        email    : req.body.email.toLowerCase(),
        photo_url: req.body.photo_url
    });

    user.save(function (err) {
        if (!err) {
            var message = 'New User created with success';

            log.info(message);
            return res.json({ user: user, status: 'ok', message: message });
        } else {
            if (err.name === 'ValidationError') {
                return error.invalidFieldError(err, res);
            } else {
                return error.genericErrorHandler(res, err.status, err.code, err.message);
            }
        }
    });
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var message = 'User found with success';

    log.info(message);
    return res.json({ user: req.user, status: 'ok', message: message });
});

router.put('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    if (req.user.socialAuth) {
        return error.genericErrorHandler(res, 400, 'user_error', 'Service available only for local users');
    } else if (!req.user.checkPassword(req.body.password)) {
        return error.genericErrorHandler(res, 400, 'user_error', 'Password is wrong!');
    } else {
        req.user.username = req.body.username            || req.user.username;
        req.user.password = req.body.new_password        || req.user.password;
        req.user.email    = req.body.email.toLowerCase() || req.user.email;
        req.user.picture  = req.body.picture             || req.user.picture;

        req.user.save(function (err) {

            if (!err) {
                var message = 'User updated with success!';

                log.info(message);
                return res.json({user: req.user, status: 'ok', message: message});
            } else {
                if (err.name === 'ValidationError') {
                    return error.invalidFieldError(err, res);
                } else {
                    return error.genericErrorHandler(res, err.status, err.code, err.message);
                }
            }
        });
    }
});

router.delete('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    if (!req.user.checkPassword(req.body.password)) {
        return error.genericErrorHandler(res, 400, 'user_error', 'Password is wrong!');
    } else {
        req.user.remove(function (err) {

            if (!err) {
                var message = 'User deleted with success!';

                log.info(message);
                return res.json({ user: req.user, status: 'ok', message: message });
            } else {
               return error.genericErrorHandler(res, err.status, err.code, err.message);
            }
        });
    }
});

module.exports = router;