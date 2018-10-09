var mongoose = require('mongoose'); //mongo connection

var Item = mongoose.model('Item');
var ItemDetail = mongoose.model('ItemDetail');

var User = mongoose.model('User');

var utils = require('../utils/utils');

var _ = require('underscore');

module.exports.getPopulatedItem = function (req, res, next) {
    var userId = req.params.userId || req.body.userId || req.query.userId || null;

    // Which fields should be populated aka don't return everything about the link user of the item
    var populateFields = [
        {path: "itemDetail", options: {lean: true}},
        {path: "appointment", options: {lean: true}},
        {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl facebook.birthday facebook.location description.hobbies facebook.lastName facebook.gender", options: {lean: true}},
        {path: "itemStars", options: {lean: true}, match: {'stars.user': {$in: [req.query.userId]}}, select: "_id"}
    ];

    // Exclude following fields which didn't need to be sent to client
    var excludeFields = "-likes -dislikes";

    Item.findOne({hashId: req.params.id}).lean().populate(populateFields).select(excludeFields).exec(function (err, item) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else if (utils.isNull(item)) {
            res.format({
                json: function () {
                    res.json(item);
                }
            });
        } else {
            // Check if user as the right to see the item
            User.findOne({_id: userId}).exec(function (err, user) {
                if (err || utils.isNull(user)) {
                    res.status(500).json({
                        error: "GET Error: There was a problem retrieving: " + err
                    });
                } else {
                    var allowed = _.isEqual(item.userLimitations.gender, "irrelevant") || _.isEqual(item.userLimitations.gender, user.facebook.gender);

                    var userAge = utils.getAge(user.facebook.birthday);
                    allowed = allowed && userAge >= item.userLimitations.age.min && userAge <= item.userLimitations.age.max;

                    res.format({
                        json: function () {
                            res.json(allowed ? item : null);
                        }
                    });
                }
            });
        }
    });
};

module.exports.editItem = function (req, res, next) {
    var itemId = req.params.id;

    var item = req.body.item;
    item.updatedAt = Date.now();

    // Delete to avoid overwrite
    delete item.likes;
    delete item.dislikes;

    var itemDetail = req.body.item.itemDetail;
    itemDetail.updatedAt = Date.now();

    var itemDetailId = itemDetail._id;

    ItemDetail.findOneAndUpdate({_id: itemDetailId}, itemDetail, {
        upsert: false,
        new: true
    }).lean().exec(function (err, updatedItemDetail) {
        if (err) {
            res.status(500).json({
                error: "There was a problem updating the information to the database: " + err
            });
        }
        else {
            // Which fields should be populated
            var populateFields = [{path: "itemDetail", options: {lean: true}}, {
                path: "appointment",
                options: {lean: true}
            }, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl facebook.birthday facebook.location description.hobbies facebook.lastName facebook.gender", options: {lean: true}}];

            // Exclude following fields which didn't need to be sent to client
            var excludeFields = "-likes -dislikes";

            Item.findOneAndUpdate({_id: itemId}, item, {
                upsert: false,
                new: true
            }).lean().populate(populateFields).select(excludeFields).exec(function (err, updatedItem) {
                if (err) {
                    res.status(500).json({
                        error: "There was a problem updating the information to the database: " + err
                    });
                }
                else {
                    res.format({
                        json: function () {
                            res.json(updatedItem);
                        }
                    });
                }
            });
        }
    });
};
