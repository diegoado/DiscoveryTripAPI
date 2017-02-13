var passport = require('passport'),
    express = require('express'),
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
    Event = require(src + 'models/event'),
    Photo = require(src + 'models/photo');


router.post('/:id', multer.single('photo'), passport.authenticate('bearer', { session: false }), function (req, res) {
    Attraction.findById(req.params.id, function (err, attraction) {
        var photo;

        if (req.file) {
            photo = new Photo({
                name: req.file.originalname,
                data: fs.readFileSync(req.file.path),
                size: req.file.size,
                encoding: req.file.encoding,
                mimetype: req.file.mimetype
            });
            if (photo.hasError()) {
                photo = undefined;
                log.warn('Cannot save photo: %s. Error caused by: %s', req.file.originalname, err.message);
            }
        }
        var event = new Event({
            ownerId    : req.user,
            name       : req.body.name,
            description: req.body.description,
            attraction : attraction,
            photo      : photo,
            kind       : req.body.kind,
            price      : req.body.price,
            keywords   : req.body.keywords,
            startDate  : req.body.startDate ? new Date(req.body.startDate) : undefined,
            endDate    : new Date(req.body.endDate)
        });
        event.save()
            .then(function()  {
                // Populate the attraction photos
                if (photo) {
                    photo.save();
                }
                var message = 'New Event created with success';

                log.info(message);
                return res.json({ event: event.toJSON(), status: 'ok', message: message });
            })
            .catch(function(err) {
                if (err.name === 'ValidationError') {
                    return error.invalidFieldError(err, res);
                } else {
                    return error.genericErrorHandler(res, err.status, err.code, err.message);
                }
            })
            .then(function() {
                if (req.file) {
                    fs.unlinkSync(req.file.path)
                }
            });
    });
});


module.exports = router;