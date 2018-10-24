const utils = require('../../controllers/utils/utils');

const constants = require('../../config/constants');

const CandidatesHelper = require('../../controllers/candidates/candidatesHelper');

const Q = require('q');

const _ = require('underscore');

module.exports = {
    findCandidates: findCandidates
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
