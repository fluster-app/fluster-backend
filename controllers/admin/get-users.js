var User = require('mongoose').model('User');

var utils = require('../utils/utils');

var constants = require('../../config/constants');

var moment = require('moment');

module.exports.getUsers = function (req, res, next) {
    var limit = constants.LIMIT_QUERY;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    // Prepare the query
    var query = {};

    if (!utils.isStringEmpty(req.query.status)) {
        query["status"] = req.query.status;
    }

    if (!utils.isStringEmpty(req.query.filterNames)) {
        query["facebook.name"] = {'$regex' : req.query.filterNames, '$options' : 'i'};
    }

    var sorting = {};

    if (!utils.isStringEmpty(req.query.sortUpdatedAt) && req.query.sortUpdatedAt === "true") {
        sorting["updatedAt"] = -1;
    } else {
        sorting["createdAt"] = -1;
    }

    // Select only fields
    var selectFields = "_id status lastLogin blocked admin createdAt updatedAt google.id facebook.id facebook.pictureUrl facebook.firstName facebook.lastName facebook.name facebook.location facebook.email facebook.birthday facebook.gender description.hobbies description.bio description.displayName description.spotify userParams";

    //retrieve all items from Mongo
    User.find(query).lean().sort(sorting).limit(limit).skip(page).select(selectFields).exec(function (err, users) {
        if (err) {
            res.status(500).json({
                error: "Get users error:" + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(users);
                }
            });
        }
    });
};

module.exports.countUsers = function (req, res, next) {

    var match = {};

    var filterName = req.query.filterName;

    var filter = null;

    if (utils.isStringEmpty(filterName) || filterName === "today") {
        filter = 'day'
    } else if (filterName === "week" || filterName === "lastweek") {
        filter = 'week'
    } else if (filterName === "month" || filterName === "lastmonth") {
        filter = 'month'
    } else if (filterName === "year" || filterName === "lastyear") {
        filter = 'year'
    }

    if (!utils.isStringEmpty(filter)) {
        var dateQuery = new Date();

        if (filterName === "lastweek" || filterName === "lastmonth" || filterName === "lastyear") {
            dateQuery = moment(dateQuery).add(-1, filter).toDate();
        }

        var subQuery = new Array();
        subQuery.push({'updatedAt': {$gte: moment(dateQuery).startOf(filter).toDate()}});
        subQuery.push({'updatedAt': {$lte: moment(dateQuery).endOf(filter).toDate()}});
        match["$and"] = subQuery;
    }

    User.aggregate([{$match: match}, {$group:{_id: "$status", count: { $sum: 1 }}}], function (err, results) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the count: " + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(results);
                }
            });
        }
    });
};