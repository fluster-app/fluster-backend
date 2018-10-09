const mongoose = require('mongoose');
const User = mongoose.model('User');

const queryUtils = require('../utils/query-utils');

const constants = require('../../config/constants');

const moment = require('moment');

module.exports.getTargetedUsersStatistics = function (req, res, next) {

    // Prepare the query
    const queryGeonear = getTargetUsersQueryGeonear(req.query);

    const startLastLogin = moment(new Date()).startOf('day').add(-1 * constants.LIMIT_TARGETED_USERS, 'd').toDate();

    const queryItems = queryUtils.addUsersFilterToQuery({lastLogin: {$gte: startLastLogin}}, req.query);

    // select count(likes), count(dislikes) from item where id = myId
    User.aggregate([{$geoNear: queryGeonear}, {$match: queryItems}], function (err, results) {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else {
            res.format({
                json: function () {
                    res.json({users: countMatchingResults(results, req.query)});
                }
            });
        }
    });
};

function countMatchingResults(results, params) {
    if (results == null) {
        return 0;
    }

    let countResults=0;
    for (let i=0; i<results.length;i++) {

        if (isDistanceMatching(results[i])) {
            countResults++;
        }
    }

    return countResults;
}

// The query searched all value in a circle of 100km (max possible user value).
// The query also calculated the distance between a match and the center
// We know filter these with this distance and their distance set in their params user
function isDistanceMatching(result) {
    const distCalculated = result.dist.calculated;

    const userDistance = result.userParams.address.distance;

    return distCalculated <= parseFloat(userDistance * 1000);
}

function getTargetUsersQueryGeonear(params) {

    // get coordinates [ <longitude>, <latitude> ]
    let coords = [];
    coords[0] = parseFloat(params.longitude);
    coords[1] = parseFloat(params.latitude);

    const query = {
        near: {type: "Point", coordinates: coords},
        distanceField: "dist.calculated",
        maxDistance: 99000, // Max userParams.address.location is 99km
        spherical: true,
        num: 10000
    };

    return query;
}
