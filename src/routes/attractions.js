var passport = require('passport'),
    express = require('express'),
    _ = require("underscore"),
    fs = require('fs');

// Create a router to attractions
var router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module),
    multer = require(src + 'helpers/multer'),
    error = require(src + 'helpers/error');

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
                data: fs.readFileSync(file.path),
                size: file.size, encoding: file.encoding, mimetype: file.mimetype
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
            _.each(req.files, function (file) {
                fs.unlinkSync(file.path)
        })
    });
    function saveLocalization(req, res, photos) {
        new Localization({
            latitude: req.body.latitude, longitude: req.body.longitude
        }).save()
            .then(function (localization) {
                saveAttraction(req, res, photos, localization);
            })
            .catch(function (err) {
                _.each(photos, function (photo) {
                    photo.remove()
                });
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
                var message = 'New Tourist Attraction created with success';

                log.info(message);
                return res.json({attraction: attraction.toSortJson(), status: 'ok', message: message});
            })
            .catch(function (err) {
                _.each(photos, function (photo) {
                    photo.remove()
                });
                localization.remove();
                error.resultError(res, err);
            })
    }
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    Attraction.findById(req.params.id)
        .populate('localization')
        .exec(function (err, attraction) {
            if (err) {

            } else if(!attraction) {

            } else {
                var message = 'Attraction found with success';

                log.info(message);
                return res.json({attraction: attraction.toJSON(), status: 'ok', message: message});
            }
    });
});

module.exports = router;