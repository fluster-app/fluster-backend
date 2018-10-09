var mongoose = require('mongoose'); //mongo connection

var ItemStars = mongoose.model('ItemStars');

var moment = require('moment');

var utils = require('../utils/utils');

module.exports.getStars = function(req, res, next) {
    var itemId = req.query.itemId;

    ItemStars.find({item: itemId}).distinct("stars.user").exec(function (err, starsIds) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the stars id list: " + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(starsIds);
                }
            });
        }
    });
};

module.exports.countDailyStars = function(req, res, next) {
    var itemId = req.query.itemId;

    var query = {
        'item': itemId
    };

    var startOfTheDay = moment(new Date()).startOf('day').toDate();
    var endOfTheDay = moment(new Date()).endOf('day').toDate();

    var subQuery = new Array();
    subQuery.push({'stars.at': {$gte: startOfTheDay}});
    subQuery.push({'stars.at': {$lte: endOfTheDay}});
    query["$and"] = subQuery;

    ItemStars.find(query).distinct("stars.user").exec(function (err, result) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json({count: utils.isNotNull(result) ? result.length : 0});
                }
            });
        }
    });
};