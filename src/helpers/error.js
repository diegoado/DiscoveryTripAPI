var src = process.cwd() + '/src/',
    log = require(src + 'helpers/log')(module);


exports.internalError = function (err, res) {
    res.statusCode = 500;
    log.error('Internal errorHandler(%d): %s', res.statusCode, err.message);

    return res.json({status: 'error', message: 'Internal Server Error'});
};

exports.invalidFieldError = function (err, res) {
    var fields = {},
        errFields = [];

    for (var field in err.errors) {
        errFields.push(field);
        fields[field] = {value: err.errors[field].value, message: err.errors[field].message};
    }
    res.statusCode = 400;
    log.error('Validation Error on Fields: ' + errFields.toString());

    return res.json({status: 'error', message: err.message, errorsOnFields: fields});
};

exports.resourceNotFoundError = function (res, customMessage) {
    res.statusCode = 404;
    log.error(customMessage);

    return res.json({status: 'error', message: customMessage});
};

exports.genericErrFn = function (cb, err) {
    if (err) {
        return cb(err);
    }
};