var passport = require('passport'),
    express = require('express'),
    crypto = require('crypto'),
    router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var db = require(src + 'db/mongoose'),
    log = require(src + 'helpers/log')(module),
    error = require(src + 'helpers/error');

// Load Models
var User = require(src + 'models/user');

//TODO(diegoado): Validate the required params before create a local user
router.post('/', function(req, res) {
    var user = new User({
        username : req.body.username,
        password : req.body.password,
        email    : req.body.email.toLowerCase(),
        photo_url: req.body.photo_url
    });

    user.save(function (err) {
        if (!err) {
            log.info('New User created with success');

            return res.json({
                user: {
                    id: user.userId, username: user.username, email: user.email,
                    photo_url: user.photo_url, created: user.created
                },
                status: 'ok', message: 'New User created with success'
            });
        } else {
            if (err.name === 'ValidationError') {
                return error.invalidFieldError(err, res);
            } else {
                return error.genericErrorHandler(res, err.status, err.code, err.message);
            }
        }
    });
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    User.findById(req.params.id, function (err, user) {
        if (!user) {
            return error.genericErrorHandler(res, 404, 'User not found!');
        } else if (!err) {
            log.info('User found with success');

            return res.json({
                user: {
                    id: user.userId, username: user.username, email: user.email,
                    photo_url: user.photo_url, created: user.created
                },
                status: 'ok',
                message: 'User found with success'
            });
        } else {
            return error.genericErrorHandler(res, err.status, err.code, err.message);
        }
    });
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {
    User.findById(req.params.id, function (err, user) {

        if (!user) {
            return error.genericErrorHandler(res, 404, 'user_error', 'User not found!');
        }

        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email.toLowerCase();
        user.picture = req.body.picture;

        user.save(function (err) {

            if (!err) {
                log.info('User updated with success!');

                return res.json({
                    user: {
                        id: user.userId, username: user.username, email: user.email,
                        photo_url: user.photo_url, created: user.created
                    },
                    status: 'ok',
                    message: 'User updated with success!'
                });
            } else {
                if (err.name === 'ValidationError') {
                    return error.invalidFieldError(err, res);
                } else {
                    return error.genericErrorHandler(res, err.status, err.code, err.message);
                }
            }
        });
    });
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {

    User.findById(req.params.id, function (err, user) {

        if (!user) {
            return error.genericErrorHandler(res, 404, 'user_error', 'User not found!');
        } else {
            user.remove(function (err) {

                if (!err) {
                    log.info('User deleted with success!');

                    return res.json({
                        user: {
                            id: user.userId, username: user.username, email: user.email,
                            photo_url: user.photo_url, created: user.created
                        },
                        status: 'ok',
                        message: 'User deleted with success!'
                    });
                } else {
                   return error.genericErrorHandler(res, err.status, err.code, err.message);
                }
            });
        }
    });
});

module.exports = router;