var mongoose = require('mongoose');

var ChatMessage = mongoose.model('ChatMessage');

var Device = require('../model/device');

var logger = require('log4js').getLogger('peterparker');

var utils = require('../controllers/utils/utils');

var pushSender = require('./push-sender');

var i18n = require("i18n");

var moment = require('moment');

module.exports = {
    pushPendingChatMessages: pushPendingChatMessages
};

function pushPendingChatMessages() {

    var nowMinus5Minutes = moment(new Date()).add(-5, 'm').toDate();

    var query = {
        read: false,
        push: false,
        updatedAt: {$lte: nowMinus5Minutes}
    };

    ChatMessage.find(query).lean().exec(function (err, chatMessages) {
        if (err) {
            logger.info('error', 'Error while looking for pending chat messages.');
        } else {
            if (utils.isNotNull(chatMessages)) {
                for (var i = 0, len = chatMessages.length; i < len; i++) {
                    sendPushChatMessages(chatMessages[i]);
                }
            }
        }
    });
}

function sendPushChatMessages(chatMessage) {
    Device.findDevice(chatMessage.userTo).then(function (device) {
        if (utils.isNotNull(device) && !utils.isStringEmpty(device.tokenId)) {
            updateAndProcessChatMessage(chatMessage, device);
        }

    }, function (error) {
        logger.info('error', 'Error while looking for device informations.');
    });
}

function updateAndProcessChatMessage(chatMessage, device) {
    chatMessage.push = true;
    chatMessage.updatedAt = Date.now();

    var populateFields = new Array();
    populateFields.push({path: "userFrom", select: "_id facebook.id facebook.firstName"}, {
        path: "userTo",
        select: "_id facebook.id facebook.firstName userParams.appSettings.pushNotifications",
        options: {lean: true}
    });

    ChatMessage.findOneAndUpdate({_id: chatMessage._id}, chatMessage, {
        upsert: true,
        new: false
    }).lean().populate(populateFields).exec(function (err, updatedChatMessage) {
        if (err) {
            logger.info('error', 'Error while updating the chat message push status.');
        } else {
            if (utils.isNotNull(updatedChatMessage.userTo.userParams) && utils.isNotNull(updatedChatMessage.userTo.userParams.appSettings) && updatedChatMessage.userTo.userParams.appSettings.pushNotifications) {

                var msgText = getPushNotificationText(updatedChatMessage, device);

                pushSender.pushNotification(msgText, device).then(function (data) {
                    // Coolio all right here
                }, function (error) {
                    logger.info('error', 'Error while pushing the chat message notification to the client. ' + JSON.stringify(error));
                });
            } else {
                // Means user don't want to receive push notifications
            }
        }
    });
}

function getPushNotificationText(chatMessage, device) {

    var language = !utils.isStringEmpty(device.language) ? device.language : 'en';

    return i18n.__({
        phrase: "CHAT_MESSAGES.NEW_CHAT_MESSAGE",
        locale: language
    }, {who: chatMessage.userFrom.facebook.firstName});
}