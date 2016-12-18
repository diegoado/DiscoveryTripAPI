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
            log.info('New Tourist Attraction created with success');

            return res.json({
                attraction: {
                    name: attraction.name, description: attraction.description,
                    localization: attraction.localization,
                    created: attraction.created,
                    state: attraction.state
                },
                status: 'ok',
                message: 'New Tourist Attraction created with success'
            });
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


