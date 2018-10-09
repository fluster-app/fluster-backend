const mongoose = require('mongoose');
const User = mongoose.model('User');

const moment = require('moment');

const utils = require('../utils/utils');

const queryUtils = require('../utils/query-utils');

const constants = require('../../config/constants');

const Q = require('q');

function CandidatesHelper() {
    this.findCandidates = findCandidates;
}

function findCandidates(userIds, page, limit, params) {
    let deferred = Q.defer();

    const startLastLogin = moment(new Date()).startOf('day').add(-1 * constants.LIMIT_CANDIDATES, 'd').toDate();

    // Prepare the query
    let query = {
        status: "active",
        blocked: false,
        lastLogin: {$gte: startLastLogin},
        "userParams.appSettings.browsing": true
    };

    if (utils.isNotNull(userIds) && userIds.length > 0) {
        query["_id"] = {$nin: userIds};
    }

    let allowSuperstarsQueries = new Array();
    allowSuperstarsQueries.push({"userParams.appSettings.allowSuperstars": true});
    allowSuperstarsQueries.push({"userParams.appSettings.allowSuperstars": null});
    query["$or"] = allowSuperstarsQueries;

    query = queryUtils.addUsersFilterToQuery(query, params);

    let coords = new Array();
    coords[0] = parseFloat(params.longitude);
    coords[1] = parseFloat(params.latitude);

    const queryGeoNear = {
        $geoNear: {
            near: {type: "Point", coordinates: coords},
            distanceField: "dist.calculated",
            maxDistance: 99000, // Max userParams.address.location is 99km
            spherical: true,
            num: 10000
        }
    };

    // Distance should be positive
    query["delta"] = {"$gte": 0};

    const project = {
        createdAt: 1,
        updatedAt: 1,
        "google.id": 1,
        "facebook.id": 1,
        "facebook.gender": 1,
        "facebook.firstName": 1,
        "facebook.birthday": 1,
        "facebook.pictureUrl": 1,
        "facebook.location": 1,
        "facebook.likes": 1,
        description: 1,
        status: 1,
        blocked: 1,
        lastLogin: 1,
        "userParams.appSettings.browsing": 1,
        "userParams.appSettings.allowSuperstars": 1,
        "userParams.appSettings.pushNotifications": 1,
        "userParams.item.type": 1,
        "userParams.item.furnished": 1,
        "userParams.item.room.room1": 1,
        "userParams.item.room.room2": 1,
        "userParams.item.room.room3": 1,
        "userParams.item.room.room4": 1,
        "userParams.item.room.room5": 1,
        "userParams.item.budget.max": 1,
        "userParams.item.budget.min": 1,
        "userParams.item.disabledFriendly": 1,
        "userParams.item.petsAllowed": 1,
        "userParams.item.availability.begin": 1,
        "userParams.item.availability.end": 1,
        delta: {
            "$subtract": [
                {"$multiply": ["$userParams.address.distance", 1000]},
                "$dist.calculated"
            ]
        }
    };

    User.aggregate([queryGeoNear, {"$project": project}, {"$match": query}]).sort({createdAt: -1}).skip(page).limit(limit).exec(function (err, users) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(users);
        }
    });

    return deferred.promise;
}

module.exports = CandidatesHelper;