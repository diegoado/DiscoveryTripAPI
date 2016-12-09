var express = require('express'),
    router = express.Router();

var src = process.cwd() + '/src/',
    log = require(src + 'log')(module),
    oauth2 = require(src + 'auth/oauth2');

router.post('/', oauth2.token);

module.exports = router;