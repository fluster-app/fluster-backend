var Subscription = require('mongoose').model('Subscription');

var constants = require('../../config/constants');

var utils = require('../utils/utils');

module.exports.getSubscriptions = function(req, res, next) {
    var selectedUserId = req.query.selectedUserId;

    var query = {
        'user': selectedUserId
    };

    var populateFields = [{path: "product", options: {lean: true}}];

    Subscription.find(query).lean().populate(populateFields).exec(function (err, subscriptions) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(subscriptions);
                }
            });
        }
    });
};

module.exports.getAllSubscriptions = function(req, res, next) {
    var limit = constants.LIMIT_QUERY;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    var query = {};

    var populateFields = [{path: "product", options: {lean: true}}, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.lastName facebook.pictureUrl", options: {lean: true}}];

    Subscription.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).populate(populateFields).exec(function (err, subscriptions) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(subscriptions);
                }
            });
        }
    });
};