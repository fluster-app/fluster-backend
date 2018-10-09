var Item = require('mongoose').model('Item');

var moment = require('moment');

var utils = require('../utils/utils');

module.exports.getLike = function (req, res, next) {

    var userId = req.query.userId;

    Item.findOne({
        hashId: req.params.id,
        'likes.user': {$in: [userId]}
    }).lean().exec(function (err, item) {
        processUpdateResults(req, res, err, item);
    });
};

module.exports.getDisLike = function (req, res, next) {

    var userId = req.query.userId;

    Item.findOne({
        hashId: req.params.id,
        'dislikes.user': {$in: [userId]}
    }).lean().exec(function (err, item) {
        processUpdateResults(req, res, err, item);
    });
};

function processUpdateResults(req, res, err, item) {
    if (err) {
        res.status(500).json({
            error: "There was a problem liking the item in the database: " + err
        });
    }
    else {
        res.format({
            json: function () {
                res.json({
                    status: utils.isNotNull(item)
                });
            }
        });
    }
}

module.exports.countDailyLikes = function(req, res, next) {
    var userId = req.query.userId;

    var query = {
        'likes.user': {$in: [userId]}
    };

    var startOfTheDay = moment(new Date()).startOf('day').toDate();
    var endOfTheDay = moment(new Date()).endOf('day').toDate();

    var subQuery = new Array();
    subQuery.push({'likes.at': {$gte: startOfTheDay}});
    subQuery.push({'likes.at': {$lte: endOfTheDay}});
    query["$and"] = subQuery;

    Item.count(query).exec(function (err, result) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json({count: result});
                }
            });
        }
    });
};