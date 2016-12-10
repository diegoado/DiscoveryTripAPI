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
        username: req.body.username,
        password: req.body.password,
        email   : req.body.email.toLowerCase()
    });

    user.save(function (err) {
        if (!err) {
            var message = 'New User created with success';

            log.info(message);
            res.json({user: user, status: 'ok', message: message});
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
            return res.json({user: user, status: 'ok'})
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

        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email.toLowerCase();

        user.save(function (err) {

            if (!err) {
                return res.json({user: user, status: 'ok', message: 'User updated'});
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
                    return res.json({user: user, status: 'ok', message: 'User deleted'});
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s', res.statusCode, err.message);

                    return res.json({status: 'error', message: 'Internal Server Error'});
                }
            });
        }
    });
});

// TODO: Move this method to client application routes
// router.get('/', /*passport.authenticate('bearer', { session: false }),*/ function(req, res) {
//     User.find(function (err, users) {
//         if (!err) {
//             return res.json(users)
//         } else {
//             res.statusCode = 500;
//             res.json({status: 'error', message: 'Internal Server Error'})
//         }
//         log.error('Internal error(%d): %s', res.statusCode, err.name);
//     })
// });

module.exports = router;