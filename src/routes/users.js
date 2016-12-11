var passport = require('passport'),
    express = require('express'),
    crypto = require('crypto'),
    router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var db = require(src + 'db/mongoose'),
    log = require(src + 'log')(module),
    errorHandler = require(src + 'error');

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
            return res.json({
                user: {
                    id: user.userId, username: user.username, email: user.email,
                    photo_url: user.photo_url, created: user.created
                },
                status: 'ok', message: message
            });
        } else {
            if (err.name === 'ValidationError') {
                return errorHandler.invalidFieldError(err, res);
            } else {
                return errorHandler.internalError(err, res);
            }
        }
    });
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    User.findById(req.params.id, function (err, user) {
        if (!user) {
            return errorHandler.resourceNotFoundError(res, 'User not found!');
        } else if (!err) {
            return res.json({
                user: {
                    id: user.userId, username: user.username, email: user.email,
                    photo_url: user.photo_url, created: user.created
                },
                status: 'ok'
            });
        } else {
            return errorHandler.internalError(err, res);
        }
    });
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {
    User.findById(req.params.id, function (err, user) {

        if (!user) {
            return errorHandler.resourceNotFoundError(res, 'User not found!');
        }

        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email.toLowerCase();
        user.picture = req.body.picture;

        user.save(function (err) {

            if (!err) {
                var message = 'User updated with success!';

                log.info(message);
                return res.json({
                    user: {
                        id: user.userId, username: user.username, email: user.email,
                        photo_url: user.photo_url, created: user.created
                    },
                    status: 'ok', message: message
                });
            } else {
                if (err.name === 'ValidationError') {
                    return errorHandler.invalidFieldError(err, res);
                } else {
                   return errorHandler.internalError(err, res);
                }
            }
        });
    });
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {

    User.findById(req.params.id, function (err, user) {

        if (!user) {
            return errorHandler.resourceNotFoundError(res, 'User not found!');
        } else {
            user.remove(function (err) {

                if (!err) {
                    var message = 'User deleted with success!';

                    log.info(message);
                    return res.json({
                        user: {
                            id: user.userId, username: user.username, email: user.email,
                            photo_url: user.photo_url, created: user.created
                        },
                        status: 'ok', message: message
                    });
                } else {
                   return errorHandler.internalError(err, res);
                }
            });
        }
    });
});

module.exports = router;