const mongoose = require('mongoose');
const Q = require('q');

const utils = require('../controllers/utils/utils');

const securityTokenSchema = mongoose.Schema({
    apiAccessToken: {type: String, required: true, index: {unique: true}},
    issueDate: {type: Date, required: true},
    expirationDate: {type: Date, required: true},
    application: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    facebookAccessToken: String,
    googleToken: {
        googleAccessToken: String,
        googleUserId: String,
        googleRefreshToken: String
    }
});

securityTokenSchema.statics.createFromApiAndFacebookToken = function(apiToken, fbToken, googleToken) {
    if (!apiToken || apiToken.apiAccessToken < 32 || ((!fbToken || fbToken.length === 0) && !googleToken)) {
        throw new Error('The Api access token and the fb or google access token are required');
    }
    const obj = new SecurityToken();
    obj.apiAccessToken = apiToken.apiAccessToken;
    obj.issueDate = apiToken.issueDate;
    obj.expirationDate = apiToken.expirationDate;
    obj.application = apiToken.application;
    obj.userId = apiToken.userId;
    obj.facebookAccessToken = fbToken;
    obj.googleToken = googleToken;
    return obj;
};

securityTokenSchema.statics.saveSecurityToken = function(securityToken) {
    let deferred = Q.defer();
    try {
        securityToken.save(function(err, savedSecurityToken) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve(savedSecurityToken);
            }
        });
    }
    catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
};

securityTokenSchema.statics.findSecurityToken = function(apiAccessToken) {
    let deferred = Q.defer();
    const query = {
        apiAccessToken: apiAccessToken
    };
    SecurityToken.findOne(query).lean().exec(function(err, foundSecurityToken) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve(foundSecurityToken);
            }
        }
    );
    return deferred.promise;
};

securityTokenSchema.statics.removeSecurityToken = function(apiAccessToken) {
    let deferred = Q.defer();
    SecurityToken.remove({ apiAccessToken: apiAccessToken }, function (err) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(apiAccessToken);
        }
    });
    return deferred.promise;
};

securityTokenSchema.statics.removeSecurityTokensForUserId = function(userId) {
    let deferred = Q.defer();
    SecurityToken.remove({ userId: userId }, function (err) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(userId);
        }
    });
    return deferred.promise;
};

securityTokenSchema.statics.authorise = function(apiAccessToken, userId) {
    let deferred = Q.defer();
    SecurityToken.findSecurityToken(apiAccessToken)
        .then(function(securityToken) {
            if (securityToken !== null && Date.now() <= securityToken.expirationDate && securityToken.userId.toString() === userId.toString()) {
                deferred.resolve(securityToken);
            }
            else {
                deferred.resolve(null);
            }
        })
        .fail(function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

securityTokenSchema.statics.authoriseRemoveExpiredToken = function(apiAccessToken, userId) {
    let deferred = Q.defer();
    SecurityToken.findSecurityToken(apiAccessToken)
        .then(function(securityToken) {
            if (securityToken !== null && Date.now() <= securityToken.expirationDate && securityToken.userId.toString() === userId.toString()) {
                deferred.resolve(securityToken);
            } else if (securityToken !== null && Date.now() > securityToken.expirationDate) {
                // If we found a securityToken and if it's expired, then we remove it
                SecurityToken.removeSecurityToken(apiAccessToken).then(function(apiAccessToken) {
                    deferred.resolve(null);
                }).fail(function(err) {
                    deferred.reject(err);
                });

            } else {
                deferred.resolve(null);
            }
        })
        .fail(function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

securityTokenSchema.statics.findNotExpiredSecurityToken = function(facebookAccessToken, googleToken) {
    let deferred = Q.defer();

    let query = {
        expirationDate: {$gt: Date.now()}
    };

    if (googleToken && !utils.isStringEmpty(googleToken.googleAccessToken)) {
        query["googleToken.googleAccessToken"] = googleToken.googleAccessToken;
    } else {
        query["facebookAccessToken"] = facebookAccessToken;
    }

    SecurityToken.findOne(query).lean().exec(function(err, foundSecurityToken) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve(foundSecurityToken);
            }
        }
    );
    return deferred.promise;
};

const SecurityToken = mongoose.model('SecurityToken', securityTokenSchema);

module.exports = SecurityToken;