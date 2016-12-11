var mongoose = require('mongoose');

// Find project working directory
var src = process.cwd() + '/src/';

var config = require(src + 'helpers/conf'),
    log = require(src + 'helpers/log')(module);

var Client = require(src + 'models/client');

// Connect to MongoDB
var MONGODB_URI;

if (process.env.PRODUCTION) {
    MONGODB_URI = process.env.MONGODB_URI;
    log.info("Starting MongoDB in Production Mode");
} else {
    MONGODB_URI = config.get('mongoose:uri');
    log.info("Starting MongoDB in Development Mode");
}

mongoose.connect(MONGODB_URI, config.get('mongoose:options'));

mongoose.connection.on('error', function (err) {
    log.error('Error to connect to MongoDB: ', err.message);
});

mongoose.connection.once('open', function callback () {
    mongoose.Promise = global.Promise;
    var client = config.get('default:client');

    Client.findOrCreate({clientId: client.clientId}, {name: client.name, clientSecret: client.clientSecret},
        function (err, client, created) {

        if (err) {
            // TODO: To think about appropriated to consume this error
        }
        if (created) {
            log.info('%s Client Application created with success!', client.name);
        }
        log.info('Connection with MongoDB established with success!');
    });
});

module.exports = mongoose;