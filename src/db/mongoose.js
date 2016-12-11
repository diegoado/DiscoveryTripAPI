var mongoose = require('mongoose');

// Find project working directory
var src = process.cwd() + '/src/';

var config = require(src + 'conf'),
    log = require(src + 'log')(module);

var Client = require(src + 'models/client');

mongoose.Promise = global.Promise;

// Connect to MongoDB
var MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, config.get('mongoose:options'));

mongoose.connection.on('error', function (err) {
    log.error('Error to connect to MongoDB: ', err.message);
});

mongoose.connection.once('open', function callback () {
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