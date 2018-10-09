var app = module.parent.exports.app;

var SecurityToken = require('../model/securityToken');
var securityPolicy = require('../controllers/authentications/securityPolicy');

var constants = require('../config/constants');

var request = require('request');

var utils = require('../controllers/utils/utils');

const FacebookHelper = require('../controllers/authentications/helpers/facebookHelper');
const facebookHelper = new FacebookHelper();

app.post('/v1/facebook/mutualfriends', securityPolicy.authorise, function (req, res) {

    var userId = req.body.userId;
    var apiAccessToken = req.body.apiAccessToken;

    var applicantFacebookId = req.body.applicantFacebookId;

    if (utils.isStringEmpty(applicantFacebookId)) {
        res.status(500).json({
            error: "No facebook mutual friends specified"
        });
    } else {
        SecurityToken.authorise(apiAccessToken, userId).then(function(securityToken) {
            if (securityToken == null) {
                res.status(500).json({
                    error: "Facebook mutual friends error: null"
                });
            } else {
                var facebookUrl = constants.FACEBOOK_URL + applicantFacebookId + '?fields=context.fields(mutual_friends)&access_token=' + securityToken.facebookAccessToken + facebookHelper.getAppSecretProofParam(securityToken.facebookAccessToken);

                request.get(facebookUrl, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var results = JSON.parse(body);

                            res.json(results);
                        } else {
                            res.status(500).json({
                                error: "Facebook mutual friends error: " + JSON.stringify(error)
                            });
                        }
                    }
                );
            }
        })
            .fail(function(err) {
                res.status(500).json({
                    error: "Facebook mutual friends error: " + JSON.stringify(err)
                });
            });

    }
});