var mongoose = require('mongoose');

var Notification = mongoose.model('Notification');

var Device = require('../model/device');

var logger = require('log4js').getLogger('peterparker');

var utils = require('../controllers/utils/utils');

var pushSender = require('./push-sender');

var i18n = require("i18n");

module.exports = {
    pushPendingNotifications: pushPendingNotifications
};

function pushPendingNotifications() {
    var query = {
        read: false,
        push: false
    };

    Notification.find(query).lean().exec(function (err, notifications) {
        if (err) {
            logger.info('error', 'Error while looking for notifications.');
        } else {
            if (utils.isNotNull(notifications)) {
                for (var i = 0, len = notifications.length; i < len; i++) {
                    sendPushNotification(notifications[i]);
                }
            }
        }
    });
}

function sendPushNotification(notification) {
    Device.findDevice(notification.userTo).then(function (device) {
        if (utils.isNotNull(device) && !utils.isStringEmpty(device.tokenId)) {
            updateAndProcessNofication(notification, device);
        }

    }, function (error) {
        logger.info('error', 'Error while looking for device informations.');
    });
}

// Rather having a problem updating the db than sending x times the same push to the user
function updateAndProcessNofication(notification, device) {

    notification.push = true;
    notification.updatedAt = Date.now();

    var populateFields = new Array();
    populateFields.push({path: "userFrom", select: "_id facebook.id facebook.firstName", options: {lean: true}}, {path: "userTo", select: "_id facebook.id facebook.firstName userParams.appSettings.pushNotifications", options: {lean: true}});

    Notification.findOneAndUpdate({_id: notification._id}, notification, {
        upsert: true,
        new: false
    }).lean().populate(populateFields).exec(function (err, updatedNotification) {
        if (err) {
            logger.info('error', 'Error while updating the notification push status.');
        } else {
            if (utils.isNotNull(updatedNotification.userTo.userParams) && utils.isNotNull(updatedNotification.userTo.userParams.appSettings) && updatedNotification.userTo.userParams.appSettings.pushNotifications) {

                var msgText = getPushNotificationText(updatedNotification, device);

                pushSender.pushNotification(msgText, device).then(function (data) {
                    // Coolio all right here
                }, function (error) {
                    // We don't parse the error, if user removed the app on his phone it will trigger an error
                });
            } else {
                // Means user don't want to receive push notifications
            }
        }
    });
}

function getPushNotificationText(notification, device) {

    var language = !utils.isStringEmpty(device.language) ? device.language : 'en';

    var textNotification;

    if ('application_new' === notification.type) {
        // New application
        textNotification = i18n.__({ phrase: "NOTIFICATIONS.ADVERTISE.TITLE", locale: language });
        textNotification += " ";
        textNotification += i18n.__({ phrase: "NOTIFICATIONS.ADVERTISE.ONE_APPLICANT", locale: language }, { who: notification.userFrom.facebook.firstName });
    } else if ('application_to_reschedule' === notification.type) {
        // Application accepted
        textNotification = i18n.__({ phrase: "NOTIFICATIONS.BROWSE.TITLE", locale: language });
        textNotification += " ";
        textNotification += i18n.__({ phrase: "NOTIFICATIONS.BROWSE.NEED_NEW_DATES", locale: language }, { who: notification.userFrom.facebook.firstName });
    } else if ('application_accepted' === notification.type) {
        // Application accepted
        textNotification = i18n.__({ phrase: "NOTIFICATIONS.BROWSE.TITLE", locale: language });
        textNotification += " ";
        textNotification += i18n.__({ phrase: "NOTIFICATIONS.BROWSE.VIEWING_ACCEPTED", locale: language }, { who: notification.userFrom.facebook.firstName });
    } else if ('superstar_new' === notification.type) {
        // New superstar
        textNotification = i18n.__({ phrase: "NOTIFICATIONS.BROWSE.TITLE", locale: language });
        textNotification += " ";
        textNotification += i18n.__({ phrase: "NOTIFICATIONS.BROWSE.NEW_SUPERSTAR", locale: language }, { who: notification.userFrom.facebook.firstName });
    } else if ('appointment_rescheduled' === notification.type) {
        // Appointment rescheduled
        textNotification = i18n.__({ phrase: "NOTIFICATIONS.BROWSE.APPOINTMENT_RESCHEDULED", locale: language }, { who: notification.userFrom.facebook.firstName });
    } else {
        return null;
    }

    return textNotification;
}
