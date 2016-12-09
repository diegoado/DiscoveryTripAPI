var express = require('express'),
    passport = require('passport'),
    router = express.Router();

/* GET API Status. */
router.get('/', function (request, response) {
    response.json({'status': 'ok', 'message': 'Discovery Trip API is running'});
});

module.exports = router;