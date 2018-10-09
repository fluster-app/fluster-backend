var SecurityToken = require('./../../model/securityToken');

var utils = require('../utils/utils');

var logger = require('log4js').getLogger('peterparker');

function authorise(req, res, next) {
    var apiAccessToken = req.body.apiAccessToken || req.query.apiAccessToken || null;
    var userId = req.params.userId || req.body.userId || req.query.userId || null;
    if (apiAccessToken && userId) {
        SecurityToken.authorise(apiAccessToken, userId)
            .then(function(securityToken) {
                if (utils.isNotNull(securityToken)) {
                    next();
                }
                else {
                    logger.info('info', 'User ' + userId + ' is not authorised. Request from address ' + req.connection.remoteAddress + '.');
                    res.status(400).json({
                        error: "User is not authorised"
                    });
                }
            }, function(err) {
                logger.info('error', 'An error has occurred while processing a request ' +
                    ' from ' +
                    req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                res.status(400).json({
                    error: err.message
                });
            });
    }
    else {
        logger.info('info', 'Bad request from ' +
            req.connection.remoteAddress + '. Api access token and user id are mandatory.');
        res.status(400).json({
            error: 'Api access token and user id are mandatory.'
        });
    }
}

exports.authorise = authorise;