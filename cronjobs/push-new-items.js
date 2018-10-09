const mongoose = require('mongoose');

const Item = mongoose.model('Item');
const CandidatesHelper = require('../controllers/candidates/candidatesHelper');

const Device = require('../model/device');

const logger = require('log4js').getLogger('peterparker');

const utils = require('../controllers/utils/utils');

const constants = require('../config/constants');

const pushSender = require('./push-sender');

const i18n = require("i18n");

const moment = require('moment');
const Q = require('q');
const _ = require('underscore');

module.exports = {
    pushNewItems: pushNewItems
};

function pushNewItems() {

    if (!constants.ARN_IOS_PROD) {
        return;
    }

    const now = new Date();
    const todayAt8am = moment().hours(8).minutes(0).seconds(0).toDate();

    let sinceWhen = moment(now).isBefore(todayAt8am) ? moment(now).add(-8, 'h').toDate() : moment(now).add(-1, 'h').toDate();

    const query = {
        status: 'published',
        createdAt: {$gt: sinceWhen, $lte: now}
    };

    Item.find(query).lean().exec(function (err, items) {
        if (err) {
            logger.info('error', 'Error while looking for notifications.');
        } else {
            if (utils.isNotEmpty(items)) {
                const promises = new Array();

                for (let i = 0, len = items.length; i < len; i++) {
                    promises.push(targetUsersAndSendPushNotification(items[i]));
                }

                Promise.all(promises).then(function (values) {

                    const uniqueUsers = _.map(_.groupBy(_.flatten(values), function (doc) {
                        return doc._id;
                    }), function (grouped) {
                        return grouped[0];
                    });

                    if (utils.isNotEmpty(uniqueUsers)) {

                        logger.info("Gonna try to send new items push notifications to " + uniqueUsers.length + " users.");

                        for (let i = 0, len = uniqueUsers.length; i < len; i++) {
                            sendPushNotification(uniqueUsers[i]);
                        }
                    }
                });
            }
        }
    });
}

function targetUsersAndSendPushNotification(item) {
    const deferred = Q.defer();

    const candidatesHelper = new CandidatesHelper();

    let query = {
        longitude: item.address.location.coordinates[0],
        latitude: item.address.location.coordinates[1],
        type: item.attributes.type,
        furnished: item.attributes.furnished,
        ageMin: item.userLimitations.age.min,
        ageMax: item.userLimitations.age.max,
        gender: item.userLimitations.gender
    };

    if (utils.isNotNull(item.attributes.rooms) && item.attributes.rooms !== 0) {
        query["rooms"] = '' + item.attributes.rooms;
    }

    if (utils.isNotNull(item.attributes.price.gross) && item.attributes.price.gross !== 0) {
        query["price"] = '' + item.attributes.price.gross;
    }

    if (utils.isNotNull(item.attributes.disabledFriendly)) {
        query["disabledFriendly"] = '' + item.attributes.disabledFriendly;
    }

    if (utils.isNotNull(item.attributes.petsAllowed)) {
        query["petsAllowed"] = '' + item.attributes.petsAllowed;
    }

    if (utils.isNotNull(item.attributes.availability.begin)) {
        query["availablebegin"] = '' + item.attributes.availability.begin;
    }

    if (utils.isNotNull(item.attributes.availability.end)) {
        query["availableend"] = '' + item.attributes.availability.end;
    }

    let likes = _.map(item.likes, function (doc) {
        return doc.user;
    });

    const dislikes = _.map(item.dislikes, function (doc) {
        return doc.user;
    });

    let userIds = new Array();
    userIds.push(item.user);

    if (utils.isNotEmpty(likes)) {
        userIds = userIds.concat(likes);
    }

    if (utils.isNotEmpty(dislikes)) {
        userIds = userIds.concat(dislikes);
    }

    candidatesHelper.findCandidates(userIds, 0, constants.MAX_ITEM_USERS, query).then(function (users) {
        deferred.resolve(users);
    }, function (err) {
        deferred.reject(new Error(err));
    });

    return deferred.promise;
}

function sendPushNotification(user) {
    Device.findDevice(user._id).then(function (device) {
        if (utils.isNotNull(device) && !utils.isStringEmpty(device.tokenId)) {
            processNofication(user, device);
        }
    }, function (error) {
        logger.info('error', 'Error while looking for device informations.');
    });
}

function processNofication(user, device) {

    if (utils.isNotNull(user.userParams) && utils.isNotNull(user.userParams.appSettings) && user.userParams.appSettings.pushNotifications) {

        const msgText = getPushNotificationText(user, device);

        pushSender.pushNotification(msgText, device).then(function (data) {
            // Coolio all right here
        }, function (error) {
            logger.info('error', 'Error while pushing the notification to the client. ' + JSON.stringify(error));
        });
    } else {
        // Means user don't want to receive push notifications
    }
}

function getPushNotificationText(user, device) {

    const language = !utils.isStringEmpty(device.language) ? device.language : 'en';

    return i18n.__({phrase: "ITEMS.NEW_ITEMS", locale: language}, {who: user.facebook.firstName});
}
