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

    return res.json({status: 'error', error: 'user_error', error_description: err.message, errorsOnFields: fields});
};

exports.genericErrorHandler = function (res, status, code, message) {
    res.statusCode = status  || 500;
    code           = code    || 'server_error';
    message        = message || 'Internal Server Error';

    log.error('%d %s', res.statusCode, message);
    return res.json({status: 'error', error: code, error_description: message});
};

exports.genericErrFn = function (cb, err) {
    if (err) {
        return cb(err);
    }
};