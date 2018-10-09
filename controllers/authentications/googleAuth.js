const {OAuth2Client} = require('google-auth-library');
const request = require('request');

const Q = require('q');

const logger = require('log4js').getLogger('peterparker');

const constants = require('../../config/constants');
const utils = require('../utils/utils');

const AuthHelper = require('./helpers/authHelper');
const authHelper = new AuthHelper();

module.exports.handleGoogleMobileLoginRequest = function(req, res, next) {
    const googleAccessToken = req.body.googleAccessToken || req.params.googleAccessToken || req.query.googleAccessToken;
    const googleIdToken = req.body.googleIdToken || req.params.googleIdToken || req.query.googleIdToken;
    const googleRefreshToken = req.body.googleRefreshToken || req.params.googleRefreshToken || req.query.googleRefreshToken;
    const applicationName = req.body.appName || req.params.appName || req.query.appName;
    const iOSPlatform = utils.isParamTrue(req.body.iOSPlatform || req.params.iOSPlatform || req.query.iOSPlatform);
    const authKey = req.body.authKey || req.params.authKey || req.query.authKey;

    if (googleAccessToken && googleAccessToken.length > 0
        && googleIdToken && googleIdToken.length > 0
        && applicationName && applicationName.length > 0 && authHelper.validAuthKey(authKey)) {

        handleGoogleLoginRequest(googleAccessToken, googleIdToken, googleRefreshToken, applicationName, iOSPlatform).then(function (userAccessToken) {
            res.status(200).json(userAccessToken);
        }, function(error) {
            res.status(500).json({
                error: error
            });
        });

    } else {
        // 400 BAD REQUEST
        res.json(400);
    }
};

module.exports.handleGooglePWALoginRequest = function(req, res, next) {
    const googleCode = req.body.googleCode || req.param('googleCode');
    const googleRedirectUri = req.body.googleRedirectUri || req.param('googleRedirectUri');
    const applicationName = req.body.appName || req.param('appName');
    const authKey = req.body.authKey || req.param('authKey');

    if (!utils.isStringEmpty(googleCode) && !utils.isStringEmpty(googleRedirectUri) && !utils.isStringEmpty(applicationName) && authHelper.validAuthKey(authKey)) {

        getGoogleAccessToken(googleCode, googleRedirectUri).then(function (googleLoginData) {

            if (!utils.isNull(googleLoginData)) {

                // we do not request refresh_token yet, see https://developers.google.com/identity/protocols/OpenIDConnect chapter 4
                handleGoogleLoginRequest(googleLoginData.access_token, googleLoginData.id_token, null, applicationName, false).then(function (userAccessToken) {
                    res.status(200).json(userAccessToken);
                }, function(error) {
                    res.status(500).json({
                        error: error
                    });
                });

            } else {
                logger.info('error', 'Login unsuccessful, bad PWA Google token');
                res.status(500).json({
                    error: 'Login unsuccessful, bad PWA Google token'
                });
            }

        }, function(error) {
            res.status(500).json({
                error: error
            });
        })
    } else {
        // 400 BAD REQUEST
        res.json(400);
    }
};

function handleGoogleLoginRequest(googleAccessToken, googleIdToken, googleRefreshToken, applicationName, iOSPlatform) {
    let deferred = Q.defer();

    if (googleAccessToken && googleAccessToken.length > 0
        && googleIdToken && googleIdToken.length > 0
        && applicationName && applicationName.length > 0) {

        const clientId = iOSPlatform ? constants.GOOGLE_LOGIN_CLIENT_ID_IOS : constants.GOOGLE_LOGIN_CLIENT_ID_WEB;

        const verifyBody = {
            idToken: googleIdToken,
            audience: clientId
        };

        const oAuth2Client = new OAuth2Client(clientId);

        oAuth2Client.verifyIdToken(verifyBody).then(function(ticket) {

            const payload = ticket.getPayload();
            const userId = payload['sub'];

            handleValidToken(userId, googleAccessToken).then(function(result) {

                buildUserProfile(userId, payload.email, result).then(function(user) {
                    let googleToken = {
                        googleAccessToken: googleAccessToken,
                        googleUserId: userId
                    };

                    // The refresh token is only provided the first time
                    // https://github.com/EddyVerbruggen/cordova-plugin-googleplus/issues/375
                    if (!utils.isStringEmpty(googleRefreshToken)) {
                        googleToken['googleRefreshToken'] = googleRefreshToken;
                    }

                    authHelper.performAuthLogin(applicationName, user, null, true, null, googleToken).
                    then(function(userAccessToken) {
                        deferred.resolve(userAccessToken);
                    }, function(err) {
                        logger.info('error', 'Perform Google login unsuccessful: ', err);
                        deferred.reject('User not found: ' + err);
                    });
                });

            }, function(error) {
                deferred.reject(error);
            });
        }, function(error) {
            deferred.reject(error);
        });
    } else {
        deferred.reject('Missing Google token');
    }

    return deferred.promise;
}

function handleValidToken(userId, googleAccessToken) {

    let deferred = Q.defer();

    const url = 'https://people.googleapis.com/v1/people/' + userId + '?personFields=names,photos,locales,genders,birthdays&access_token=' + googleAccessToken;

    request.get(url, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            deferred.resolve(JSON.parse(body));
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
}

function buildUserProfile(userId, email, peopleResult) {
    let deferred = Q.defer();

    let userProfile = {
        googleUserId: userId,
        email: email
    };

    if (utils.isNotEmpty(peopleResult.names)) {
        userProfile["name"] = peopleResult.names[0].displayName;
        userProfile["lastName"] = peopleResult.names[0].familyName;
        userProfile["firstName"] = peopleResult.names[0].givenName;
    }

    if (utils.isNotEmpty(peopleResult.birthdays)) {
        // https://stackoverflow.com/a/49727076/5404186
        for (let i = 0, len = peopleResult.birthdays.length; i < len; i++) {
            if (peopleResult.birthdays[i].metadata.source.type === 'ACCOUNT') {

                const year = peopleResult.birthdays[i].date.year;
                const month = peopleResult.birthdays[i].date.month;
                const day = peopleResult.birthdays[i].date.day;

                if (!utils.isStringEmpty(year) && !utils.isStringEmpty(month) && !utils.isStringEmpty(day)) {
                    userProfile["birthday"] = new Date(year, month, day);
                }
            }
        }
    }

    if (utils.isNotEmpty(peopleResult.photos)) {
        userProfile["pictureUrl"] = peopleResult.photos[0].url;
    }

    if (utils.isNotEmpty(peopleResult.genders)) {
        userProfile["gender"] = peopleResult.genders[0].value;
    }

    deferred.resolve(userProfile);

    return deferred.promise;
}

// https://developers.google.com/identity/protocols/OpenIDConnect
// Chapter 4. Exchange code for access token and ID token
function getGoogleAccessToken(googleCode, googleRedirectUri) {
    const deferred = Q.defer();

    let path = constants.GOOGLE_LOGIN_TOKEN_URL + '?client_id=' + constants.GOOGLE_LOGIN_CLIENT_ID_WEB;
    path += '&redirect_uri=' + googleRedirectUri;
    path += '&client_secret=' + constants.GOOGLE_LOGIN_CLIENT_SECRET;
    path += '&code=' + googleCode + '&grant_type=authorization_code';

    request.post(path, function (error, response, body) {
        if (!error && response && response.statusCode && response.statusCode == 200) {
            deferred.resolve(JSON.parse(body));
        }
        else if (response && utils.isNotNull(body)) {
            const dataError = JSON.parse(body);

            deferred.reject({code: response.statusCode, message: dataError.error.message});
        } else {
            deferred.reject({code: 400, message: "Verify Google login error"});
        }
    });
    return deferred.promise;
}
