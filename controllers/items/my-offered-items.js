var mongoose = require('mongoose');
var Item = mongoose.model('Item');

var utils = require('../utils/utils');

module.exports.getMyOfferedItems = function (req, res, next) {
    var limit = utils.isStringEmpty(req.query.limit) ? 100 : parseInt(req.query.limit);

    var userId = req.query.userId;
    var query = {
        user: userId,
        status: "published"
    };

    // Which fields should be populated
    var populateFields = [{path: "itemDetail", options: {lean: true}}, {path: "appointment", options: {lean: true}}, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl facebook.birthday facebook.location description.hobbies facebook.lastName facebook.gender", options: {lean: true}}];

    // Exclude following fields which didn't need to be sent to client
    var excludeFields = "-likes -dislikes";

    Item.find(query).lean().limit(limit).populate(populateFields).sort({createdAt: -1}).select(excludeFields).exec(function (err, items) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(items);
                }
            });
        }
    });
};

module.exports.setStatus = function (req, res, next) {
    var newStatus = req.body.newStatus;

    // Which fields should be populated
    var populateFields = [{path: "itemDetail", options: {lean: true}}, {path: "appointment", options: {lean: true}}, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl facebook.birthday facebook.location description.hobbies facebook.lastName facebook.gender", options: {lean: true}}];

    var updateQuery = {
        status: newStatus,
        updatedAt: Date.now()
    };

    Item.findByIdAndUpdate(req.params.id, updateQuery, {new: true}).lean().populate(populateFields).exec(function (err, item) {
        if (err) {
            res.status(500).json({
                error: "There was a problem closing the item in the database: " + err
            });
        }
        else {
            res.format({
                json: function () {
                    res.json(item);
                }
            });
        }
    });
};

module.exports.setEnd = function (req, res, next) {
    var newEnd = req.body.end;

    // Which fields should be populated
    var populateFields = [{path: "itemDetail", options: {lean: true}}, {path: "appointment", options: {lean: true}}, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl facebook.birthday facebook.location description.hobbies facebook.lastName facebook.gender", options: {lean: true}}];

    var updateQuery = {
        end: newEnd,
        updatedAt: Date.now()
    };

    Item.findByIdAndUpdate(req.params.id, updateQuery, {new: true}).lean().populate(populateFields).exec(function (err, item) {
        if (err) {
            res.status(500).json({
                error: "There was a problem change the end date of the item in the database: " + err
            });
        }
        else {
            res.format({
                json: function () {
                    res.json(item);
                }
            });
        }
    });
};
