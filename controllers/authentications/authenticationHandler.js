const SecurityToken = require('./../../model/securityToken');

const Q = require('q');

const logger = require('log4js').getLogger('peterparker');

const utils = require('../utils/utils');

const UserHelper = require('./helpers/userHelper');
const userHelper = new UserHelper();

const AuthHelper = require('./helpers/authHelper');
const authHelper = new AuthHelper();

// URL: /api/auth/logout
// POST parameter:
// apiAccessToken: the token to access the API
// userId: Id of the user who is trying to log out
// Perform the logout operation, deleting the related security token so that it will be invalidated
// returns: 200 if logout successful
module.exports.handleLogoutRequest = function(req, res, next) {
    const apiAccessToken = req.body.apiAccessToken || req.param('apiAccessToken');
    const userId = req.body.userId || req.param('userId');

    const status = req.body.status || req.param('status');

    if (apiAccessToken) {
        SecurityToken.findSecurityToken(apiAccessToken)
            .then(function(securityToken) {
                SecurityToken.removeSecurityToken(apiAccessToken)
                    .then(function(apiAccessToken) {
                        // Log out successful
                        disableAccount(userId, status).then(function(user) {
                            res.status(200).json({
                                result: 'OK'
                            });    
                        }, function(err) {
                            logger.info('error', 'An error has occurred while attempting to log out user ' + userId +
                                ' from address ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                            res.status(500).json({
                                error: err.message
                            });
                        });
                        
                    }, function(err) {
                        logger.info('error', 'An error has occurred while attempting to log out user ' + userId +
                            ' from address ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                        res.status(500).json({
                            error: err.message
                        });
                    });
            }, function(err) {
                logger.info('error', 'An error has occurred while attempting to log out user ' + userId +
                    ' from address ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                res.status(500).json({
                    error: err.message
                });
            });
    }
    else {
        // 400 BAD REQUEST
        logger.info('error', 'Bad log out request from ' +
            req.connection.remoteAddress + '. Reason: api access token required.');
        res.json(400);
    }
};

module.exports.handleLoginRequest = function(req, res, next) {
    const token = req.body.token || req.param('token');
    const userId = req.body.userId || req.param('userId');

    if (token && token.length > 0 && userId && userId.length > 0) {
        SecurityToken.authoriseRemoveExpiredToken(token, userId)
            .then(function(currentSecurityToken) {
                if (utils.isNotNull(currentSecurityToken)) {
                    userHelper.findByUserId(currentSecurityToken.userId)
                        .then(function(user) {
                            if (utils.isNull(user)) {
                                res.status(500).json({
                                    error:'Login user not found '
                                });
                            }
                            else {
                                authHelper.updateUserLastLogin(user, currentSecurityToken).then(function(userAccess) {
                                    res.status(200).json(userAccess);
                                }, function(err) {
                                    res.status(500).json({
                                        error:'Login token not updated ' + err
                                    });
                                });
                            }
                        });
                } else {
                    res.status(500).json({
                        error:'Access token not found'
                    });
                }
            }, function(err) {
                res.status(500).json({
                    error:'Login token not found ' + err
                });
            }).fail(function(err) {
                res.status(500).json({
                    error:'Login token failed ' + err
                });
            });
    }
    else {
        // 400 BAD REQUEST
        logger.info('error', 'Bad login request from ' + req.connection.remoteAddress);
        res.json(400);
    }
};

function disableAccount(userId, status) {
    let deferred = Q.defer();

    userHelper.disableAccount(userId, status).then(function(user) {
        deferred.resolve(user);
    }, function(error) {
        deferred.reject(error);
    }).fail(function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
}
