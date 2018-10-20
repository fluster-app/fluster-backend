const Device = require('../model/device');

const logger = require('log4js').getLogger('peterparker');

const utils = require('../../controllers/utils/utils');

const constants = require('../../config/constants');

const CandidatesHelper = require('../../controllers/candidates/candidatesHelper');

const pushSender = require('./push-sender');

const i18n = require("i18n");

const Q = require('q');

module.exports = {
    findCandidates: findCandidates,
    sendPushNotification: sendPushNotification
};

function findCandidates(item, ageMin, ageMax, lastLoginInDays) {
    const deferred = Q.defer();

    const candidatesHelper = new CandidatesHelper();

    let query = {
        longitude: item.address.location.coordinates[0],
        latitude: item.address.location.coordinates[1],
        type: item.attributes.type,
        furnished: item.attributes.furnished,
        ageMin: ageMin,
        ageMax: ageMax,
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

    candidatesHelper.findCandidates(userIds, 0, constants.MAX_ITEM_USERS, query, lastLoginInDays).then((users) => {
        deferred.resolve(users);
    }, (err) => {
        deferred.reject(new Error(err));
    });

    return deferred.promise;
}

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