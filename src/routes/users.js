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
                res.json({status: 'error', message: err.message, errorsOnFields: fields});
            } else {
                res.statusCode = 500;
                res.json({status: 'error', message: 'Internal Server Error'});
            }
            log.error('Internal error(%d): %s', res.statusCode, err.message);
        }
    });
});

// router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
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

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    res.json({'message': 'This is not implemented now!'});
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {
    res.json({'message': 'This is not implemented now!'});
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {
    res.json({'message': 'This is not implemented now!'});
});

module.exports = router;