var passport = require('passport'),
    express = require('express'),
    _ = require("underscore"),
    fs = require('fs');

// Create a router to attractions
var router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var error = require(src + 'helpers/error'),
    log = require(src + 'helpers/log')(module);

var multer = require(src + 'helpers/multer'),
    georedis = require(src + 'helpers/georedis');

// Load Models
var Attraction = require(src + 'models/attraction'),
    Photo = require(src + 'models/photo'),
    Localization = require(src + 'models/localization');


router.post('/', multer.array('photos', 10), passport.authenticate('bearer', { session: false }), function(req, res) {
    var photos = [];

    _.each(req.files, function (file) {
        photos.push(
            new Photo({
                name: file.originalname,
                data: new Buffer(fs.readFileSync(file.path, 'base64'), 'base64'),
                size: file.size,
                encoding: 'base64', mimetype: file.mimetype
            })
        )
    });

    Photo.insertMany(photos)
        .then(function (photos) {
            saveLocalization(req, res, photos);
        })
        .catch(function (err) {
            error.resultError(res, err);
        })
        .then(function () {
            _.each(req.files, function (file) { fs.unlinkSync(file.path) });
    });
    function saveLocalization(req, res, photos) {
        new Localization({
            latitude: req.body.latitude, longitude: req.body.longitude
        }).save()
            .then(function (localization) {
                saveAttraction(req, res, photos, localization);
            })
            .catch(function (err) {
                _.each(photos, function (photo) { photo.remove() });

                // Request result in an Error
                error.resultError(res, err);
            })
    }
    function saveAttraction(req, res, photos, localization) {
        new Attraction({
            ownerId:      req.user,
            name:         req.body.name,
            description:  req.body.description,
            category:     req.body.category,
            photos:       photos,
            localization: localization
        }).save()
            .then(function (attraction) {
                // Add new attraction in search engine
                georedis.addLocalization(attraction._id, req.body.latitude, req.body.longitude);

                // Request result not in an Error
                var message = 'New Tourist Attraction created with success!';

                log.info(message);
                return res.json({attraction: attraction.toSortJSON(), status: 'ok', message: message});
            })
            .catch(function (err) {
                localization.remove();
                _.each(photos, function (photo) { photo.remove() });

                // Request result in an Error
                error.resultError(res, err);
            })
    }
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    error.genericErrorHandler(res, 500, "server_error", "Route not implemented!");
});


module.exports = router;