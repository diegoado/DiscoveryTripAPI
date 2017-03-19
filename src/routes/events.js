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
            startDate  : req.body.startDate ? new Date(req.body.startDate) : new Date(),
            endDate    : new Date(req.body.endDate)
        }).save()
            .then(function (event) {
                // Add new attraction in search engine
                georedis.addLocalization(event._id, req.body.latitude, req.body.longitude);

                // Request result not in an Error
                var message = 'New Event created with success!';
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

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    error.genericErrorHandler(res, 500, "server_error", "Route not implemented!");
});

router.get('/interestme', passport.authenticate('bearer', { session: false }), function (req, res) {
    var today    = new Date(),
        iniOfDay = today.toISOString().split('T')[0] + 'T00:00:00.000Z',
        endOfDay = today.toISOString().split('T')[0] + 'T23:59:59.999Z';

    var query = [
        { interested: req.user.userId }, { endDate: { $gte: new Date(iniOfDay), $lte: new Date(endOfDay) }}
    ];
    Event.find({ $and: query })
        .populate('localization')
        .exec(function (err, events) {
            var message;
            if (err) {
                error.genericErrorHandler(res, err.status, err.code, err.message);
            } else {
                if (!events.length) {
                    message = "No event has been found of user interest for today";
                    log.info(message);
                } else {
                    message = "Was found events of interest to the user for today";
                }
                res.json({events: events, status: 'ok', message: message});
            }
        });
});

router.post('/:id/interestme', passport.authenticate('bearer', {session: false }), function (req, res) {
    var update = { interested: req.user.userId },
        query  = [{ _id: req.params.id }, { interested: { $ne: req.user.userId }}];

    Event.findOneAndUpdate({ $and: query }, { $push: update }, { new: true }, function (err, event) {
        var message;
        if (err) {
            error.genericErrorHandler(res, err.status, err.code, err.message);
        } else if (!event) {
            message = "Event by id " + req.params.id +
                      " not found or user interest it's already gone registered on this event";

            log.error(message);
            error.genericErrorHandler(res, 400, 'user_error', message);
        } else {
            message = "User interest on event " + event._id + " registered with success";
            return res.json({status: 'ok', message: message})
        }
    })
});

router.delete('/:id/interestme', passport.authenticate('bearer', {session: false }), function (req, res) {
    var update = { interested: req.user.userId },
        query  = [{ _id: req.params.id }, { interested: req.user.userId }];

    Event.findOneAndUpdate({ $and: query }, { $pull: update }, {new: true }, function (err, event) {
        var message;
        if (err) {
            error.genericErrorHandler(res, err.status, err.code, err.message);
        } else if (!event) {
            message = "Event by id " + req.params.id +
                " not found or user interest it's not registered on this event";

            log.error(message);
            error.genericErrorHandler(res, 400, 'user_error', message);
        } else {
            message = "User interest on event " + event._id + " unregistered with success";
            return res.json({status: 'ok', message: message})
        }
    })
});


module.exports = router;