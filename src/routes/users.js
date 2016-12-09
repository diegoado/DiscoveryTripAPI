var passport = require('passport'),
    express = require('express'),
    router = express.Router();

var src = process.cwd() + '/src/',
    db = require(src + 'db/mongoose');

router.get('/', function(request, response) {
    response.json({'message': 'This is not implemented now!'});
});

router.post('/', function(request, response) {
    response.json({'message': 'This is not implemented now!'});
});

router.get('/:id', function(request, response) {
    response.json({'message': 'This is not implemented now!'});
});

router.put('/:id', function (request, response) {
    response.json({'message': 'This is not implemented now!'});
});

router.delete('/:id', function (request, response) {
    response.json({'message': 'This is not implemented now!'});
});

module.exports = router;