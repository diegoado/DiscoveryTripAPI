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
    Photo = require(src + 'models/photo');


router.post('/', multer.array('photos', 10), passport.authenticate('bearer', { session: false }), function(req, res) {
    var photos = [];

    _.each(req.files, function (file) {
        var photo = new Photo({
            name: file.originalname,
            data: fs.readFileSync(file.path),
            size: file.size,
            encoding: file.encoding,
            mimetype: file.mimetype
        }),
            err = photo.hasError();

        if (!err) {
            photos.push(photo);
        } else {
            log.warn('Cannot save photo: %s. Error caused by: %s', file.originalname, err.message);
        }
    });
    var attraction = new Attraction({
        ownerId:   req.user,
        name:        req.body.name,
        description: req.body.description,
        category:    req.body.category,
        photos:      photos,
        localization: {
            latitude: req.body.latitude, longitude: req.body.longitude
        }
    });
    attraction.save()
        .then(function()  {
            // Populate the attraction photos
            _.each(photos, function (photo) {
                photo.save()
            });
            var message = 'New Tourist Attraction created with success';

            log.info(message);
            return res.json({ attraction: attraction.toJSON(), status: 'ok', message: message });
        })
        .catch(function(err) {
            if (err.name === 'ValidationError') {
                return error.invalidFieldError(err, res);
            } else {
                return error.genericErrorHandler(res, err.status, err.code, err.message);
            }
        })
        .then(function() {
            _.each(req.files, function (file) {
                fs.unlinkSync(file.path)
            });
        });
});

module.exports = router;