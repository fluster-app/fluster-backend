var Item = require('mongoose').model('Item');

var utils = require('../utils/utils');

var constants = require('../../config/constants');

// var moment = require('moment');

module.exports.getItems = function (req, res, next) {
    var limit = constants.LIMIT_ITEMS;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex);
        page = page > 0 ? constants.LOAD_NEXT_ITEMS : 0;

        if (!utils.isStringEmpty(req.query.onlyDisliked) && req.query.onlyDisliked === "true") {
            let countDisliked = 0;
            if (!utils.isStringEmpty(req.query.countDisliked)) {
                countDisliked = parseInt(req.query.countDisliked);
            }

            page += countDisliked;
        }
    }

    // Prepare the query
    var query = getQuery(req.query);

    // Which fields should be populated aka don't return everything about the link user of the item
    // Note: itemStars: Don't return everything, just _id. If object is there => item is starred, if not = not starred
    var populateFields = [
        {path: "itemDetail", options: {lean: true}},
        {path: "appointment", options: {lean: true}},
        {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl facebook.birthday facebook.location description.hobbies facebook.lastName facebook.gender", options: {lean: true}},
        {path: "itemStars", options: {lean: true}, match: {'stars.user': {$in: [req.query.userId]}}, select: "_id"}
    ];

    // Exclude following fields which didn't need to be sent to client
    var excludeFields = "-likes -dislikes";

    //retrieve all items from Mongo
    Item.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).populate(populateFields).select(excludeFields).exec(function (err, items) {
        if (err) {
            res.status(500).json({
                error: "Get items error:" + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(utils.isNotEmpty(items) ? items.reverse() : items);
                }
            });
        }
    });
};

function getQuery(params) {

    // get the max distance or set it to 8 kilometers
    var maxDistance = utils.isNotNull(params.distance) ? params.distance : constants.DEFAULT_DISTANCE;
    maxDistance = parseFloat(maxDistance * 1000);

    // get coordinates [ <latitude>, <longitude> ]
    var coords = [];
    coords[0] = params.longitude;
    coords[1] = params.latitude;

    // user
    var userId = params.userId;

    var query = {
        'address.location': {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: coords
                },
                $maxDistance: maxDistance
            }
        },
        'status': 'published',
        'end': {$gte: Date.now()},
        'likes.user': {$nin: [userId]}
    };

    query['dislikes.user'] = (!utils.isStringEmpty(params.onlyDisliked) && params.onlyDisliked === "true") ? {$in: [userId]} : {$nin: [userId]};

    var subOrQueries = new Array();

    // Attributes
    getQueryAttributes(query, params, subOrQueries);

    // User limitations
    getQueryUserLimitations(params, query, subOrQueries);

    query["$and"] = subOrQueries;

    return query;
}


function getQueryAttributes(query, params, subOrQueries) {
    if (!utils.isStringEmpty(params.type)) {
        query["attributes.type"] = params.type;
    }

    if (!utils.isStringEmpty(params.furnished)) {
        query["attributes.furnished"] = params.furnished;
    }

    if (!utils.isStringEmpty(params.rooms)) {
        var res = params.rooms.split(",");

        var subRoomsQueries = new Array();

        for (var i = 0; i < res.length; i++) {
            if ("room1" === res[i]) {
                subRoomsQueries.push({"attributes.rooms": {$gte: 0, $lt: 2}});
            } else if ("room2" === res[i]) {
                subRoomsQueries.push({"attributes.rooms": {$gte: 2, $lt: 3}});
            } else if ("room3" === res[i]) {
                subRoomsQueries.push({"attributes.rooms": {$gte: 3, $lt: 4}});
            } else if ("room4" === res[i]) {
                subRoomsQueries.push({"attributes.rooms": {$gte: 4, $lt: 5}});
            } else if ("room5" === res[i]) {
                subRoomsQueries.push({"attributes.rooms": {$gte: 5}});
            }
        }

        subOrQueries.push({"$or": subRoomsQueries});
    }

    if (utils.isNotNull(params.minPrice) && utils.isNotNull(params.maxPrice)) {
        query["attributes.price.gross"] = {$gte: params.minPrice, $lte: params.maxPrice};
    } else if (utils.isNotNull(params.minPrice)) {
        query["attributes.price.gross"] = {$gte: params.minPrice};
    } else if (utils.isNotNull(params.maxPrice)) {
        query["attributes.price.gross"] = {$lte: params.maxPrice};
    }

    if (!utils.isStringEmpty(params.disabledFriendly) && params.disabledFriendly === "true") {
        query["attributes.disabledFriendly"] = params.disabledFriendly;
    }

    if (!utils.isStringEmpty(params.petsAllowed) && params.petsAllowed === "true") {
        query["attributes.petsAllowed"] = params.petsAllowed;
    }

    // if (!utils.isStringEmpty(params.availablebegin)) {
    //     // Check a week before entered user date, not that relevant
    //     var beginBeginAvailabilityDate = moment(new Date(params.availablebegin)).add(constants.APPROX_BEGIN_AVAILABILITY, 'w').toDate();
    //
    //     query["attributes.availability.begin"] = {$lte: beginBeginAvailabilityDate};
    // } else {
    //     query["attributes.availability.begin"] = {$lte: new Date()};
    // }
    //
    // if (!utils.isStringEmpty(params.availableend)) {
    //     // Check a week after entered user date, not that relevant
    //     var beginEndAvailabilityDate = moment(new Date(params.availableend)).add(-1 * constants.APPROX_END_AVAILABILITY, 'w').toDate();
    //     var endEndAvailabilityDate = moment(new Date(params.availableend)).add(constants.APPROX_END_AVAILABILITY, 'w').toDate();
    //
    //     query["attributes.availability.end"] = {$gte: beginEndAvailabilityDate, $lte: endEndAvailabilityDate};
    // } else {
    //     query["attributes.availability.end"] = null;
    // }

}

function getQueryUserLimitations(params, query, subOrQueries) {
    const age = params.age;

    if (typeof age !== 'undefined' && age !== null) {
        query["userLimitations.age.min"] = {$lte: age};
        query["userLimitations.age.max"] = {$gte: age};
    }

    const gender = params.gender;

    let subGenderQueries = new Array();
    subGenderQueries.push({"userLimitations.gender": "irrelevant"});

    if (!utils.isStringEmpty(gender)) {
        subGenderQueries.push({"userLimitations.gender": gender});
    }

    subOrQueries.push({"$or": subGenderQueries});
}
