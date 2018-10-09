var Device = require('../../model/device');

var utils = require('../utils/utils');

var moment = require('moment');

module.exports.getDevicePlatform = function(req, res, next) {
    var searchedUserId = req.params.id;

    Device.findDevice(searchedUserId).then(function (device) {
        res.format({
            json: function(){
                res.json({platform: utils.isNotNull(device) ? device.platform : null});
            }
        });
    }, function(error) {
        res.status(500).json({
            error: "GET Error: There was a problem retrieving the device: " + err
        });
    });
};

module.exports.countDevices = function (req, res, next) {

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
        subQuery.push({'createdAt': {$gte: moment(dateQuery).startOf(filter).toDate()}});
        subQuery.push({'createdAt': {$lte: moment(dateQuery).endOf(filter).toDate()}});
        match["$and"] = subQuery;
    }

    Device.aggregate([{$match: match}, {$group:{_id: {iOS: "$platform.iOS", android: "$platform.android"}, count: { $sum: 1 }}}], function (err, results) {
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