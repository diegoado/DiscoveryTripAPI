var src = process.cwd() + '/src/',
    log = require(src + 'helpers/log')(module);

exports.invalidFieldError = function (err, res) {
    var fields = {},
        errFields = [];

    for (var field in err.errors) {
        errFields.push(field);
        fields[field] = {value: err.errors[field].value, message: err.errors[field].message};
    }
    res.statusCode = 400;
    log.error('Validation Error on Fields: ' + errFields.toString());

    return res.json({status: 'error', error_description: err.message, errorsOnFields: fields});
};

exports.genericErrorHandler = function (res, code, message) {
    res.statusCode = code    || 500;
    message        = message || 'Internal Server Error';

    log.error(message);
    return res.json({status: 'error', error_description: message});
};

exports.genericErrFn = function (cb, err) {
    if (err) {
        return cb(err);
    }
};