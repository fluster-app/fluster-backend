var utils = require('../../controllers/utils/utils');
var constants = require('../../config/constants');

var Q = require('q');

var AWS = require('aws-sdk');

module.exports = {
    pushNotification: pushNotification
};

function pushNotification(textMsg, device) {
    var deferred = Q.defer();

    if (utils.isNotNull(device.platform) && (device.platform.iOS || device.platform.android) && !utils.isStringEmpty(textMsg)) {

        var sns = new AWS.SNS();

        var arn;

        if (device.platform.iOS) {
            arn = constants.ARN_IOS_PROD ? constants.ARN_IOS_PROD_SANDBOX_URL : constants.ARN_IOS_DEV_SANDBOX_URL;
        } else {
            arn = constants.ARN_ANDROID_URL;
        }

        sns.createPlatformEndpoint({
            PlatformApplicationArn: arn,
            Token: device.tokenId
        }, function (err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                if (utils.isStringEmpty(textMsg)) {
                    deferred.reject(new Error("No status and text msg supported for that kind of notification"));
                } else {
                    var endpointArn = data.EndpointArn;

                    var payload;

                    if (device.platform.iOS && constants.ARN_IOS_PROD) {
                        payload = {
                            default: textMsg,
                            APNS: {
                                aps: {
                                    alert: textMsg,
                                    sound: 'default',
                                    badge: 1
                                }
                            }
                        };

                        // first have to stringify the inner APNS object...
                        payload.APNS = JSON.stringify(payload.APNS);
                    } else if (device.platform.iOS && !constants.ARN_IOS_PROD) {
                        payload = {
                            default: textMsg,
                            APNS_SANDBOX: {
                                aps: {
                                    alert: textMsg,
                                    sound: 'default',
                                    badge: 1
                                }
                            }
                        };

                        payload.APNS_SANDBOX = JSON.stringify(payload.APNS_SANDBOX);

                    } else {
                        // Android: http://docs.aws.amazon.com/fr_fr/sns/latest/dg/mobile-push-send-custommessage.html
                        payload = {
                            GCM: {
                                data: {
                                    message: textMsg
                                }
                            }
                        };

                        payload.GCM = JSON.stringify(payload.GCM);
                    }

                    // then have to stringify the entire message payload
                    payload = JSON.stringify(payload);

                    // Order of element in json is important
                    sns.publish({
                        MessageStructure: 'json',
                        Message: payload,
                        TargetArn: endpointArn
                    }, function (error, data) {
                        if (error) {
                            deferred.reject(error);
                        } else {
                            deferred.resolve(data);
                        }
                    });
                }
            }
        });
    } else {
        // We only support android and iOS
        deferred.reject(new Error("Plaform not supported"));
    }

    return deferred.promise;
}