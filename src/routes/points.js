var mongoose = require('mongoose'),
    passport = require('passport'),
    express = require('express'),
    _ = require("underscore"),
    fs = require('fs');

// Create a router to attractions
var router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var error = require(src + 'helpers/error'),
    log = require(src + 'helpers/log')(module);

var georedis = require(src + 'helpers/georedis');

// Load Models
var Point = require(src + 'models/point');

router.get('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    Point.find({ ownerId: req.user.userId })
        .populate('localization')
        .exec(function (err, points) {
            var message;
            if (err) {
                error.genericErrorHandler(res, err.status, err.code, err.message);
            } else if (!points) {
                // Request result not in an Error, but any point was found
                message = 'Not found any point that belongs to user by id: ' + req.user.userId;

                log.info(message);
                res.json({points: [], status: 'ok', message: message});
            } else {
                message = 'Points found with success';

                log.info(message);
                return res.json({points: points, status: 'ok', message: message});
            }
        })
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    Point.findById(req.params.id)
        .populate('localization')
        .exec(function (err, point) {
            if (err) {
                error.genericErrorHandler(res, err.status, err.code, err.message);
            } else if (!point) {
                error.genericErrorHandler(res, 404, 'user_error', 'Point not found!');
            } else {
                var message = 'Point found with success';

                log.info(message);
                return res.json({point: point, status: 'ok', message: message});
            }
        });
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    Point.findById(req.params.id, function (err, point) {
        if (err) {
            error.genericErrorHandler(res, err.status, err.code, err.message);
        } else if (!point) {
            error.genericErrorHandler(res, 404, 'user_error', 'Point not found!');
        } else if (point.ownerId !== req.user.userId) {
            log.info(typeof point.ownerId + ' ' + typeof req.user.userId);
            error.genericErrorHandler(res, 404, 'user_error', 'Only the owner of the point can remove it!');
        } else {
            point.remove(function (err) {
                if (err) {
                    error.genericErrorHandler(res, 500, "server_error", err.message)
                } else {
                    // Remove attraction in search engine
                    georedis.deleteLocalization(point._id);

                    // Request result not in an Error
                    var message = 'Point deleted with success!';

                    log.info(message);
                    return res.json({ point: point, status: 'ok', message: message });
                }
            });
        }
    })
});


module.exports = router;