var passport = require('passport'),
    express = require('express'),
    crypto = require('crypto'),
    multer = require('multer'),
    _ = require("underscore"),
    fs = require('fs');

// Create a router to attractions
var router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module),
    config = require(src + 'helpers/conf'),
    error = require(src + 'helpers/error');

// Load Models
var Attraction = require(src + 'models/attraction'),
    Photo = require(src + 'models/photo');

var upload = multer({dest: src + '../public/images/',
    limits: {
        fields: 10,
        fieldSize: 2097152,
        files: 10,
        fileSize : 5242880
    },
    rename: function(fieldname, filename) {
        return filename;
    },
    onFileUploadStart: function(file) {
        if(config.get('images:mimetype').indexOf(file.mimetype) < 0) {
            return false;
        }
    },
    inMemory: true
});

router.post('/', upload.array('photos', 10), passport.authenticate('bearer', { session: false }), function(req, res) {
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
        userId:      req.user,
        name:        req.body.name,
        description: req.body.description,
        category:    req.body.category,
        photos:      photos,
        localization: {
            latitude: req.body.latitude, longitude: req.body.longitude
        }
    });
    attraction.save(function (err) {
        if (!err) {
            // Populate the attraction photos
            _.each(photos, function (photo) {
                photo.save()
            });
            Attraction.deepPopulate('photos');

            var message = 'New Tourist Attraction created with success';

            log.info(message);
            return res.json({ attraction: attraction.toJSON(), status: 'ok', message: message });
        } else {
            if (err.name === 'ValidationError') {
                return error.invalidFieldError(err, res);
            } else {
                return error.genericErrorHandler(res, err.status, err.code, err.message);
            }
        }
    });
});

module.exports = router;