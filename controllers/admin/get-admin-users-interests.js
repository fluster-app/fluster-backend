var UserInterests = require('mongoose').model('UserInterests');

var utils = require('../utils/utils');

var constants = require('../../config/constants');

module.exports.getUsersInterests = function (req, res, next) {
    var limit = constants.LIMIT_QUERY;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    // Prepare the query
    var query = {};

    var populateFields = [{path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl", options: {lean: true}}];

    UserInterests.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).populate(populateFields).exec(function (err, userInterests) {
        if (err) {
            res.status(500).json({
                error: "Get user interests error:" + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(userInterests);
                }
            });
        }
    });
};

module.exports.getUserInterests = function (req, res, next) {

    // Prepare the query
    var query = {_id: req.params.id};

    //retrieve all products from Mongo
    UserInterests.findOne(query).lean().sort({createdAt: -1}).exec(function (err, userInterests) {
        if (err) {
            res.status(500).json({
                error: "Get user interests error:" + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(userInterests);
                }
            });
        }
    });
};