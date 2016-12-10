var passport = require('passport'),
    express = require('express'),
    crypto = require('crypto'),
    router = express.Router();

var src = process.cwd() + '/src/',
    db = require(src + 'db/mongoose'),
    log = require(src + 'log')(module),
    User = require(src + 'models/user');

router.post('/', function(req, res) {
    var user = new User({
        name     : req.body.name,
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
                    id: user.userId, name: user.name, email: user.email, photo_url: user.photo_url, created: user.created
                },
                status: 'ok', message: message
            });
        } else {
            if (err.name === 'ValidationError') {
                res.statusCode = 400;

                var fields = {};
                for (var field in err.errors) {
                    fields[field] = {value: err.errors[field].value, message: err.errors[field].message};
                }
                return res.json({status: 'error', message: err.message, errorsOnFields: fields});
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s', res.statusCode, err.message);

                return res.json({status: 'error', message: 'Internal Server Error'});
            }
        }
    });
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    User.findById(req.params.id, function (err, user) {
        if (!user) {
            res.statusCode = 404;
            return res.json({status: 'error', message: 'User not found!'})
        } else if (!err) {
            return res.json({
                user: {
                    id: user.userId, name: user.name, email: user.email, photo_url: user.photo_url, created: user.created
                },
                status: 'ok'
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({status: 'ok', message: 'Internal Server Error'});
        }
    });
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {
    User.findById(req.params.id, function (err, user) {

        if (!user) {
            res.statusCode = 404;
            return res.json({status: 'error', message: 'User not found!'})
        }

        user.name = req.body.name;
        user.password = req.body.password;
        user.email = req.body.email.toLowerCase();
        user.picture = req.body.picture;

        user.save(function (err) {

            if (!err) {
                return res.json({
                    user: {
                        id: user.userId, name: user.name, email: user.email, photo_url: user.photo_url, created: user.created
                    },
                    status: 'ok', message: 'User updated'
                });
            } else {
                if (err.name === 'ValidationError') {
                    res.statusCode = 400;

                    var fields = {};
                    for (var field in err.errors) {
                        fields[field] = {value: err.errors[field].value, message: err.errors[field].message};
                    }
                    return res.json({status: 'error', message: err.message, errorsOnFields: fields});
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s', res.statusCode, err.message);

                    return res.json({status: 'error', message: 'Internal Server Error'});
                }
            }
        });
    });
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {

    User.findById(req.params.id, function (err, user) {

        if (!user) {
            res.statusCode = 404;
            return res.json({status: 'error', message: 'User not found!'})
        } else {
            user.remove(function (err) {

                if (!err) {
                    return res.json({
                        user: {
                            id: user.userId, name: user.name, email: user.email, photo_url: user.photo_url, created: user.created
                        },
                        status: 'ok', message: 'User deleted'
                    });
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s', res.statusCode, err.message);

                    return res.json({status: 'error', message: 'Internal Server Error'});
                }
            });
        }
    });
});

module.exports = router;