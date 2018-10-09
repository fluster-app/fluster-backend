var Item = require('mongoose').model('Item');

var utils = require('../utils/utils');

var constants = require('../../config/constants');

module.exports.getItems = function (req, res, next) {
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

    if (!utils.isStringEmpty(req.query.ended)) {
        query["end"] = req.query.ended === "true" ? {$lt: Date.now()} : {$gte: Date.now()};
    }

    // Which fields should be populated aka don't return everything about the link user of the item
    var populateFields = [{path: "itemDetail", select: "_id otherPhotos", options: {lean: true}}, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl", options: {lean: true}}];

    // Select only fields
    var selectFields = "hashId source voucher status attributes.type attributes.price.gross address.addressName end createdAt updatedAt user mainPhoto userLimitations itemDetail";

    //retrieve all items from Mongo
    Item.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).select(selectFields).populate(populateFields).exec(function (err, items) {
        if (err) {
            res.status(500).json({
                error: "Get users error:" + err
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