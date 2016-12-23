var nodemailer = require('nodemailer'),
    EmailTemplate = require('email-templates').EmailTemplate;

// Find project working directory
var src = process.cwd() + '/src/';

var config = require(src + 'helpers/conf'),
    error = require(src + 'helpers/error'),
    log = require(src + 'helpers/log')(module);

var transporter     = nodemailer.createTransport(config.get('smtpConfig')),
    sendPwdReminder = transporter.templateSender(new EmailTemplate(src + '../public/email-templates'), {
        subject: 'Password reminder',
        from: config.get('smtpConfig:auth:user')
    });

var mailer = {
    isRunning: function () {
        return transporter.verify();
    },
    sendPwdReminder: function (res, user) {
        sendPwdReminder({
            to: user.email
        }, {
            username: user.username,
            password: user.password
        }, function(err) {
            if (err) {
                return error.genericErrorHandler(res, err.status, err.code, err.message);
            } else {
                var message = 'Password reminder sent to user ' + user.username +' with success!';

                log.info(message);
                return res.json({ status: 'ok', message: message});
            }
        });
    }
};

module.exports = mailer;