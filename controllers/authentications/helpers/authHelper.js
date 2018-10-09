const SecurityToken = require('./../../../model/securityToken');

const UserAccess = require('../tokens/userAccess');
const ApiAccessToken = require('../tokens/apiAccessToken');

const Q = require('q');

const utils = require('../../utils/utils');

const UserHelper = require('./userHelper');
const userHelper = new UserHelper();

const constants = require('../../../config/constants');

function AuthHelper() {
    this.performAuthLogin = performAuthLogin;
    this.updateUserLastLogin = updateUserLastLogin;
    this.validAuthKey = validAuthKey;
}

// Retrieve or create a user, generate api access token and store api and tokens
// Return api access token + account obj
function performAuthLogin(appName, userProfile, fbAccessToken, doCreate, tokenExpiresIn, googleToken) {
    let deferred = Q.defer();
    if (appName && userProfile && (fbAccessToken || googleToken)) {
        userHelper.findOrCreateAccount(userProfile, doCreate)
            .then(function(user) {
                if (user == null) {
                    deferred.reject(new Error("Invalid token ID"));
                } else if (!utils.isStringEmpty(userProfile.facebookUserId) && user.facebook.id != userProfile.facebookUserId) {
                    deferred.reject(new Error("Invalid Facebook token ID"));
                } else if (!utils.isStringEmpty(userProfile.googleUserId) && user.google.id != userProfile.googleUserId) {
                    deferred.reject(new Error("Invalid Google token ID"));
                } else {
                    // Update the account name, lastname and email, if they are changed since last login
                    userHelper.hasAccountChanged(user, userProfile).then(function(hasChanged) {
                        if (hasChanged) {
                            userHelper.updateAccount(userProfile).then(function(updatedUser) {
                                saveSecurityAndUpdateLasLogin(updatedUser, appName, fbAccessToken, tokenExpiresIn, googleToken).then(function(userAccess) {
                                    deferred.resolve(userAccess);
                                }, function(error) {
                                    deferred.reject(error);
                                }).fail(function(err) {
                                    deferred.reject(err);
                                });
                            }, function(error) {
                                deferred.reject(error);
                            }).fail(function(err) {
                                deferred.reject(err);
                            });
                        } else {
                            saveSecurityAndUpdateLasLogin(user, appName, fbAccessToken, tokenExpiresIn, googleToken).then(function(userAccess) {
                                deferred.resolve(userAccess);
                            }, function(error) {
                                deferred.reject(error);
                            }).fail(function(err) {
                                deferred.reject(err);
                            });
                        }
                    });
                }
            }, function(error) {
                deferred.reject(error);
            }).fail(function(err) {
            deferred.reject(err);
        });
    } else {
        deferred.reject(new Error("Missing info to perform the auth login"));
    }
    return deferred.promise;
}

function saveSecurityAndUpdateLasLogin(user, appName, fbAccessToken, tokenExpiresIn, googleToken) {
    let deferred = Q.defer();

    SecurityToken.findNotExpiredSecurityToken(fbAccessToken, googleToken)
        .then(function(currentSecurityToken) {
            if (utils.isNotNull(currentSecurityToken)) {
                updateUserLastLogin(user, currentSecurityToken).then(function(userAccess) {
                    deferred.resolve(userAccess);
                }, function(err) {
                    deferred.reject(err);
                });
            } else {
                const apiAccessToken = new ApiAccessToken(user._id, appName, tokenExpiresIn);

                try {
                    const securityToken = SecurityToken.createFromApiAndFacebookToken(apiAccessToken, fbAccessToken, googleToken);

                    SecurityToken.saveSecurityToken(securityToken)
                        .then(function(savedSecurityToken){
                            updateUserLastLogin(user, savedSecurityToken).then(function(userAccess) {
                                deferred.resolve(userAccess);
                            }, function(err) {
                                deferred.reject(err);
                            });
                        }, function(error) {
                            deferred.reject(error);
                        });
                } catch (e) {
                    deferred.reject(e);
                }
            }
        }, function(err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function updateUserLastLogin(user, apiAccessToken) {
    let deferred = Q.defer();

    userHelper.updateLastLogin(user).then(function (updateUser) {
        findSubscriptionAndBuildUserAccess(updateUser, apiAccessToken).then(function(userAccess) {
            deferred.resolve(userAccess);
        }, function(err) {
            deferred.reject(err);
        });
    }, function(error) {
        deferred.reject(error);
    }).fail(function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
}

function findSubscriptionAndBuildUserAccess(user, apiAccessToken) {
    let deferred = Q.defer();

    userHelper.findActiveSubscriptionByUserId(user).then(function (subscription) {
        const userAccess = new UserAccess(user, apiAccessToken.apiAccessToken, apiAccessToken.expirationDate, subscription);
        deferred.resolve(userAccess);
    }, function(error) {
        deferred.reject(error);
    }).fail(function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
}

function validAuthKey(authKey) {
    return !utils.isStringEmpty(authKey) && authKey === constants.AUTH_SECRET;
}

module.exports = AuthHelper;