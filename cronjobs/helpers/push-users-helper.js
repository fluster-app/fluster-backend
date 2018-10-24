const Device = require('../../model/device');

const logger = require('log4js').getLogger('peterparker');

const pushSender = require('./push-sender');

const i18n = require("i18n");

const utils = require('../../controllers/utils/utils');

module.exports = {
    sendPushNotification: sendPushNotification
};

function sendPushNotification(user, labelKey) {
    Device.findDevice(user._id).then(function (device) {
        if (utils.isNotNull(device) && !utils.isStringEmpty(device.tokenId)) {
            processNofication(user, device, labelKey);
        }
    }, function (error) {
        logger.info('error', 'Error while looking for device informations.');
    });
}

function processNofication(user, device, labelKey) {

    if (utils.isNotNull(user.userParams) && utils.isNotNull(user.userParams.appSettings) && user.userParams.appSettings.pushNotifications) {

        const msgText = getPushNotificationText(user, device, labelKey);

        pushSender.pushNotification(msgText, device).then(function (data) {
            // Coolio all right here
        }, function (error) {
            logger.info('error', 'Error while pushing the notification to the client. ' + JSON.stringify(error));
        });
    } else {
        // Means user don't want to receive push notifications
    }
}

function getPushNotificationText(user, device, labelKey) {

    const language = !utils.isStringEmpty(device.language) ? device.language : 'en';

    return i18n.__({phrase: labelKey, locale: language}, {who: user.facebook.firstName});
}
