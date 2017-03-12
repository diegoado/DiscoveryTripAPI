var passport = require('passport'),
    express = require('express'),
    fs = require('fs');

// Create a router to attractions
var router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var multer = require(src + 'helpers/multer'),
    georedis = require(src + 'helpers/georedis');

var log = require(src + 'helpers/log')(module),
    error = require(src + 'helpers/error');

// Load Models
var Localization = require(src + 'models/localization'),
    Event = require(src + 'models/event'),
    Photo = require(src + 'models/photo');


router.post('/', multer.single('photo'), passport.authenticate('bearer', { session: false }), function (req, res) {
    if (req.file) {
        new Photo({
            name: req.file.originalname,
            data: new Buffer(fs.readFileSync(req.file.path, 'base64'), 'base64'),
            size: req.file.size,
            encoding: 'base64', mimetype: req.file.mimetype
        }).save()
            .then(function (photo) {
                saveLocalization(req, res, photo)
            })
            .catch(function(err) {
                error.resultError(res, err);
            })
            .then(function () {
                fs.unlinkSync(req.file.path);
            })
    } else {
        saveLocalization(req, res, null);
    }

    function saveLocalization(req, res, photo) {
        new Localization({
            latitude: req.body.latitude, longitude: req.body.longitude
        }).save()
            .then(function (localization) {
                saveEvent(req, res, photo, localization);
            })
            .catch(function (err) {
                if (photo) {
                    photo.remove()
                }

                // Request result in an Error
                error.resultError(res, err);
            })
    }
    function saveEvent(req, res, photo, localization) {
        new Event({
            ownerId      : req.user,
            name         : req.body.name,
            description  : req.body.description,
            localization : localization,
            photo        : photo,
            kind         : req.body.kind,
            price        : req.body.price,
            keywords     : req.body.keywords,
            startDate  : req.body.startDate ? new Date(req.body.startDate) : undefined,
            endDate    : new Date(req.body.endDate)
        }).save()
            .then(function (event) {
                // Add new attraction in search engine
                georedis.addLocalization(event._id, req.body.latitude, req.body.longitude);

                // Request result not in an Error
                var message = 'New Event created with success!';

                log.info(message);
                return res.json({event: event, status: 'ok', message: message});
            })
            .catch(function (err) {
                if (photo) {
                    photo.remove()
                }
                localization.remove();

                // Request result in an Error
                error.resultError(res, err);
            })
    }
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    Event.findById(req.params.id)
        .populate('localization')
        .exec(function (err, event) {
            if (err) {
                error.genericErrorHandler(res, err.status, err.code, err.message);
            } else if (!event) {
                error.genericErrorHandler(res, 404, 'user_error', 'Attraction not found!');
            } else {
                var message = 'Event found with success';

                log.info(message);
                return res.json({event: event, status: 'ok', message: message});
            }
        });
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    error.genericErrorHandler(res, 500, "server_error", "Route not implemented!");
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    Event.findById(req.params.id, function (err, event) {
        if (err) {
            error.genericErrorHandler(res, err.status, err.code, err.message);
        } else if (!event) {
            error.genericErrorHandler(res, 404, 'user_error', 'Attraction not found!');
        } else if (event.ownerId !== req.user.userId) {
            error.genericErrorHandler(res, 404, 'user_error', 'Only the owner of the attraction can remove it!');
        } else {
            event.remove(function (err) {
                if (err) {
                    error.genericErrorHandler(res, 500, "server_error", err.message)
                } else {
                    // Remove attraction in search engine
                    georedis.deleteLocalization(event._id);

                    // Request result not in an Error
                    var message = 'Event deleted with success!';

                    log.info(message);
                    return res.json({ event: event, status: 'ok', message: message });
                }
            });
        }
    })
});


module.exports = router;