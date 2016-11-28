var express      = require('express'),
    path         = require('path'),
    logger       = require('morgan'),
    bodyParser   = require('body-parser'),
    cookieParser = require('cookie-parser');

var app = express();

var port = process.env.PORT || 8080;

app.use(bodyParser());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// API routes
var router = express.Router();

router.get('/', function (request, response) {
    response.json({'status': 'ok', 'message': 'Discovery Trip API is running'});
});

// Register routes
app.use('/api', router);

// Server Init
app.listen(port, function () {
   console.log('Server running on port ' + port);
});