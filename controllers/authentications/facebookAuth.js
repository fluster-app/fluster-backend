const constants = require('../../config/constants');

const utils = require('../utils/utils');

const logger = require('log4js').getLogger('peterparker');

const Q = require('q');

const request = require('request');

const FacebookHelper = require('./helpers/facebookHelper');
const facebookHelper = new FacebookHelper();

const AuthHelper = require('./helpers/authHelper');
const authHelper = new AuthHelper();

// URL: /api/auth/facebook/mobile
// POST parameters:
// fbToken: facebook user access token
// appName: application name
// returns: a userAccessToken object if login successful
module.exports.handleFacebookMobileLoginRequest = function(req, res, next) {
    const facebookAccessToken = req.body.fbToken || req.param('fbToken');
    const fbAccessTokenExpiresIn = req.body.fbTokenExpiresIn || req.param('fbTokenExpiresIn');
    const applicationName = req.body.appName || req.param('appName');
    const authKey = req.body.authKey || req.param('authKey');

    if (!utils.isStringEmpty(facebookAccessToken) && !utils.isStringEmpty(applicationName && authHelper.validAuthKey(authKey))) {
        verifyPerformFacebookLoginRequest(facebookAccessToken, fbAccessTokenExpiresIn, applicationName).then(function(userAccessToken) {
            res.status(200).json(userAccessToken);
        }, function(err) {
            res.status(500).json({
                error: err
            })
        });
    }
    else {
        // 400 BAD REQUEST
        logger.info('error', 'Bad login request from ' +
            req.connection.remoteAddress + '. Reason: facebook access token and application name are required.');
        res.json(400);
    }
};


module.exports.handleFacebookPWALoginRequest = function(req, res, next) {
    const facebookCode = req.body.fbCode || req.param('fbCode');
    const facebookRedirectUri = req.body.fbRedirectUri || req.param('fbRedirectUri');
    const applicationName = req.body.appName || req.param('appName');
    const authKey = req.body.authKey || req.param('authKey');

    if (!utils.isStringEmpty(facebookCode) && !utils.isStringEmpty(facebookRedirectUri) && !utils.isStringEmpty(applicationName) && authHelper.validAuthKey(authKey)) {

        getFacebookAccessToken(facebookCode, facebookRedirectUri).then(function (fbLoginData) {

            const facebookAccessToken = fbLoginData.access_token;
            const fbAccessTokenExpiresIn = fbLoginData.expires_in;

            verifyPerformFacebookLoginRequest(facebookAccessToken, fbAccessTokenExpiresIn, applicationName).then(function(userAccessToken) {
                res.status(200).json(userAccessToken);
            }, function(err) {
                res.status(500).json({
                    error: err
                })
            });
        }, function(error) {
            logger.info('error', 'Login unsuccessful: ' + error.message +
                ' . Request from address ' + req.connection.remoteAddress + ' .');
            res.status(500).json({
                error: error.message
            });
        })
    } else {
        // 400 BAD REQUEST
        logger.info('error', 'Bad login request from ' +
            req.connection.remoteAddress + '. Reason: facebook code, redirect uri and application name are required.');
        res.json(400);
    }
};

module.exports.handleFacebookAdminLoginRequest = function(req, res, next) {
    const facebookAccessToken = req.body.fbToken || req.param('fbToken');
    const applicationName = req.body.appName || req.param('appName');
    const fbAccessTokenExpiresIn = req.body.fbTokenExpiresIn || req.param('fbTokenExpiresIn');
    const authKey = req.body.authKey || req.param('authKey');

    if (!utils.isStringEmpty(facebookAccessToken) && !utils.isStringEmpty(applicationName) && authHelper.validAuthKey(authKey)) {
        verifyPerformFacebookLoginRequest(facebookAccessToken, fbAccessTokenExpiresIn, applicationName).then(function(userAccessToken) {
            if (userAccessToken && userAccessToken.admin) {
                // Return the login view model to the client only if admin
                res.status(200).json(userAccessToken);
            } else {
                res.status(500).json({
                    error:'Only admin allowed to access these services'
                });
            }
        }, function(err) {
            res.status(500).json({
                error: err
            })
        });
    }
    else {
        // 400 BAD REQUEST
        logger.info('error', 'Bad admin login request from ' + req.connection.remoteAddress);
        res.json(400);
    }
};

// https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
function getFacebookAccessToken(fbCode, fbRedirectUri) {
    const deferred = Q.defer();

    let path = constants.FACEBOOK_URL + 'oauth/access_token?client_id=' + constants.FACEBOOK_APP_ID;
    path += '&redirect_uri=' + fbRedirectUri;
    path += '&client_secret=' + constants.FACEBOOK_APP_SECRET;
    path += '&code=' + fbCode;

    request(path, function (error, response, body) {
        if (!error && response && response.statusCode && response.statusCode == 200) {
            deferred.resolve(JSON.parse(body));
        }
        else if (response && utils.isNotNull(body)) {
            const dataError = JSON.parse(body);

            deferred.reject({code: response.statusCode, message: dataError.error.message});
        } else {
            deferred.reject({code: 400, message: "Verify Facebook login error"});
        }
    });
    return deferred.promise;
}


// Call facebook API to verify the token is valid
// https://graph.facebook.com/me?access_token=$token
// This function can be integration tested using https://developers.facebook.com/tools/explorer/?method=GET&path=me
// to obtain a user access token for my account
// Get facebook user id as well and save it into the db. Add a field into the Account model.
// Also try and get the expiration time of the token as well
// GET graph.facebook.com/debug_token?input_token={token-to-inspect}&access_token={app-token-or-admin-token}
function verifyFacebookUserAccessToken(token) {
    let deferred = Q.defer();
    let path = constants.FACEBOOK_URL + 'me?fields=id,name,first_name,last_name,middle_name,email,birthday,picture,gender,locale,location,likes&access_token=' + token;

    // http://stackoverflow.com/questions/24799608/how-to-get-localized-values-from-facebook-open-graph-api-through-koala
    // https://www.facebook.com/translations/FacebookLocales.xml
    // Always US because of gender male/female
    path += '&locale=en_US';

    path += facebookHelper.getAppSecretProofParam(token);

    request(path, function (error, response, body) {
        if (!error && response && response.statusCode && response.statusCode == 200) {

            const data = JSON.parse(body);

            const userProfile = {
                facebookUserId: data.id,
                name: data.name,
                firstName: data.first_name,
                lastName: data.last_name,
                middleName: data.middle_name,
                email: data.email,
                birthday: utils.isNotNull(data.birthday) ? new Date(data.birthday) : null,
                pictureUrl: data.picture.data.url,
                gender:data.gender,
                location:data.location,
                likes:data.likes
            };
            deferred.resolve(userProfile);
        }
        else if (response && utils.isNotNull(body)) {
            const dataError = JSON.parse(body);

            deferred.reject({code: response.statusCode, message: dataError.error.message});
        } else {
            deferred.reject({code: 400, message: "Verify Facebook login error"});
        }
    });
    return deferred.promise;
}

function verifyPerformFacebookLoginRequest(facebookAccessToken, fbAccessTokenExpiresIn, applicationName) {
    const deferred = Q.defer();

    // Get back user object from Facebook
    verifyFacebookUserAccessToken(facebookAccessToken).
        then(function(user) {
            // Invoke wrapper function performLogin and return on deferred resolved
            authHelper.performAuthLogin(applicationName, user, facebookAccessToken, true, fbAccessTokenExpiresIn, null).
                then(function(userAccessToken) {
                    deferred.resolve(userAccessToken);
                }, function(err) {
                    deferred.reject(err);
                });
            }, function(error) {
                deferred.reject(error);
            }
    ).fail(function(error){
        deferred.reject(error);
    });

    return deferred.promise;
}