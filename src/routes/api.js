var express = require('express'),
    router = express.Router();


/* GET API Status. */
router.get('/', function (req, res) {
    res.json({status: 'ok', message: 'Discovery Trip API is running'});
});

module.exports = router;