var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var Device = require('../model/device');

var utils = require('../controllers/utils/utils');

app.post('/v1/push/', securityPolicy.authorise, function (req, res) {
    var apiAccessToken = req.body.apiAccessToken || req.param('apiAccessToken');
    var userId = req.body.userId || req.param('userId');

    var deviceTokenId = req.body.deviceTokenId;

    var iOSPlatform = req.body.iOSPlatform;
    var androidPlatform = req.body.androidPlatform;

    var deviceLanguage = req.body.deviceLanguage;

    // Save device token and type into db
    var device = {
        tokenId: deviceTokenId,
        platform: {
            iOS: !utils.isStringEmpty(iOSPlatform) && "true" === iOSPlatform,
            android: !utils.isStringEmpty(androidPlatform) && "true" === androidPlatform
        },
        language: deviceLanguage
    };

    Device.findAndUpdateDevice(userId, device).then(function (updatedDevice) {
        res.json({
            success: true
        });
    }, function(error) {
        res.status(500).json({
            error: "Push register error: " + JSON.stringify(error)
        });
    });
});