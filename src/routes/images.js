var passport = require('passport'),
    express = require('express'),
    fs = require('fs');

// Create a router to attractions
var router = express.Router();

// Find project working directory
var src = process.cwd() + '/src/';

var log = require(src + 'helpers/log')(module),
    error = require(src + 'helpers/error');

// Load Models
var Photo = require(src + 'models/photo');


router.get('/:id/download', passport.authenticate('bearer', { session: false }), function(req, res) {
    Photo.findById(req.params.id, function (err, photo) {
        if (err) {
            error.genericErrorHandler(res, err.status, err.code, err.message);
        } else if (!photo) {
            error.genericErrorHandler(res, 404, 'user_error', 'Photo not found');
        } else {
            var filepath = src + '../public/images/' + photo.name;

            fs.writeFileSync(filepath, photo.data, photo.encoding);
            // Read the image using fs and send the image content back in the response
            fs.readFile(filepath, function (err, content) {
                if (err) {
                    error.genericErrorHandler(res, 500, 'server_error', 'Cannot read image');
                } else {
                    res.setHeader('Content-disposition', 'attachment; filename=' + photo.name);

                    res.contentType(photo.mimetype);
                    res.end(content, 'binary');
                }
                fs.unlinkSync(filepath);
            });
        }
    });
});

module.exports = router;