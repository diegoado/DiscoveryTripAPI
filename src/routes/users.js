var passport = require('passport'),
    express = require('express'),
    router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module),
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
            var message = 'New User created with success';

            log.info(message);
            return res.json({ user: user.toJSON(), status: 'ok', message: message });
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
            var message = 'User found with success';

            log.info(message);
            return res.json({ user: user.toJSON(), status: 'ok', message: message });
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
                var message = 'User updated with success!';

                log.info(message);
                return res.json({ user: user.toJSON(), status: 'ok', message: message });
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
                    var message = 'User deleted with success!';

                    log.info(message);
                    return res.json({ user: user.toJSON(), status: 'ok', message: message });
                } else {
                   return error.genericErrorHandler(res, err.status, err.code, err.message);
                }
            });
        }
    });
});

module.exports = router;