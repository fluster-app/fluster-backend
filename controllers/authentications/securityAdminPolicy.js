var User = require('mongoose').model('User');

var utils = require('../utils/utils');

var logger = require('log4js').getLogger('peterparker');

function authoriseAdmin(req, res, next) {
    var userId = req.params.userId || req.body.userId || req.query.userId || null;
    if (userId) {
        User.findOne({_id: userId, admin: true}).lean().exec(function (err, user) {
            if (err) {
                logger.info('error', 'An error has occurred while processing a request ' +
                    ' from ' +
                    req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                res.status(400).json({
                    error: err.message
                });
            } else if (utils.isNotNull(user) && user.admin) {
                next();
            } else {
                logger.info('info', 'User ' + userId + ' is not an authorised admin. Request from address ' + req.connection.remoteAddress + '.');
                res.status(400).json({
                    error: "User is not an authorised admin"
                });
            }
        });
    }
    else {
        logger.info('info', 'Bad admin request from ' +
            req.connection.remoteAddress + '. Api access token and user id are mandatory.');
        res.status(400).json({
            error: 'Api admin user id is mandatory.'
        });
    }
}

exports.authoriseAdmin = authoriseAdmin;