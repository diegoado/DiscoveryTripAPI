var passport = require('passport'),
    express = require('express');

// Create a router to attractions
var router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var error = require(src + 'helpers/error'),
    log   = require(src + 'helpers/log')(module);

var georedis = require(src + 'helpers/georedis');

// Regex expressions to test input latitude and longitude
var regExpLatitude  = /^(\+|-)?(?:90(?:(?:\.0{1,8})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,8})?))$/,
    regExpLongitude = /^(\+|-)?(?:180(?:(?:\.0{1,8})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,8})?))$/;

// Load Models
var Point = require(src + 'models/point');


router.get('/name', passport.authenticate('bearer', { session: false }), function (req, res) {
    var text = req.query.text;

    if (!text) {
        error.genericErrorHandler(res, 400, "user_error", "Some input text is required in this search!");
    } else {
        var message;
        Point.find({ $or: [{ name: text }, { description: { $regex: text }}, { keywords: text }] })
            .select('-guests')
            .populate('localization')
            .exec(function (err, points) {
                if (err) {
                    log.error(err.message);

                    error.genericErrorHandler(res, 500, "server_error", "mongodb_error")
                } else if (!points.length) {
                    // Request result not in an Error, but any point was found
                    message = "Not found any point that matches with input text";

                    log.info(message);
                    res.json({points: [], status: 'ok', message: message});
                } else {
                    // Request result not in an Error
                    message = "Were found points that matches with input text";

                    log.info(message);
                    res.json({points: points, status: "ok", message: message});

                }
            });
    }
});

router.get('/points', passport.authenticate('bearer', { session: false }), function(req, res) {
    var latitude  = req.query.latitude,
        longitude = req.query.longitude,
        distance  = parseInt(req.query.distance, 10) || 5000;

    if (!latitude || !longitude) {
        error.genericErrorHandler(res, 400, "user_error", "Latitude and Longitude is required in this search!");
    } else if(!regExpLatitude.test(latitude) || !regExpLongitude.test(longitude)) {
        error.genericErrorHandler(res, 400, "user_error", "Invalid Latitude or Longitude matches!");
    } else {
        var message;
        georedis.searchNearbyLocalizations(latitude, longitude, distance, function (err, result) {
            if (err) {
                log.error(err.message);

                error.genericErrorHandler(res, 500, "server_error", "Search engine error");
            } else if (!result.length) {
                // Request result not in an Error, but any point was found
                message = "Not found any point near the input coordinates";

                log.info(message);
                res.json({points: [], status: 'ok', message: message});
            } else {
                Point.find({_id: { $in: result }})
                    .select('-guests')
                    .populate('localization')
                    .exec(function (err, points) {
                        if (err) {
                            log.error(err.message);

                            error.genericErrorHandler(res, 500, "server_error", "mongodb_error")
                        } else {
                            // Request result not in an Error
                            message = "Were found points near the input coordinates";

                            log.info(message);
                            res.json({points: points, status: "ok", message: message});
                        }
                    });
            }
        })
    }
});


module.exports = router;