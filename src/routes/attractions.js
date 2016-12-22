var passport = require('passport'),
    express = require('express'),
    crypto = require('crypto'),
    router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module),
    error = require(src + 'helpers/error');

// Load Models
var Attraction = require(src + 'models/attraction');

//TODO(diegoado): In construction
router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var attraction = new Attraction({
        userId: req.user, name: req.body.name, description: req.body.description, category: req.body.category,
        localization: {
            latitude: req.body.latitude, longitude: req.body.longitude
        }
    });

    attraction.save(function (err) {
        if (!err) {
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


