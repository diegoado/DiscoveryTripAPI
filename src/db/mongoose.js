var mongoose = require('mongoose');

var src = process.cwd() + '/src/',
    config = require(src + 'conf'),
    log = require(src + 'log')(module);

// Connect to MongoDB
mongoose.connect(config.get('mongoose:uri'));

mongoose.connection.on('error', function (err) {
    log.error('Error to connect to MongoDB: ', err.message);
});

mongoose.connection.once('open', function callback () {
    log.info('Connection with MongoDB established with success!');
});

module.exports = mongoose;