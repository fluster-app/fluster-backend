var mongoose = require('mongoose');
var Item = mongoose.model('Item');

const utils = require('../utils/utils');

module.exports.setVoucherStatusNoUser = function (req, res, next) {
    // Which fields should be populated
    const populateFields = [{path: "itemDetail", options: {lean: true}}, {path: "appointment", options: {lean: true}}, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl", options: {lean: true}}];

    // We don't want a user in case of a voucher
    const updateQuery = {
        user: undefined,
        status: "initialized",
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

module.exports.getPopulatedItem = function(req, res, next) {
    // Which fields should be populated aka don't return everything about the link user of the item
    const populateFields = [{path: "itemDetail", options: {lean: true}}, {path: "appointment", options: {lean: true}}, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl description.languages", options: {lean: true}}];

    // Exclude following fields which didn't need to be sent to client
    const excludeFields = "-likes -dislikes";

    Item.findOne({hashId: req.params.id}).lean().populate(populateFields).select(excludeFields).exec(function(err, item) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(item);
                }
            });
        }
    });
};

module.exports.editHighlight = function (req, res, next) {

    const highlight = !utils.isStringEmpty(req.body.highlight) && req.body.highlight == 'true';

    const updateQuery = {
        highlight: highlight,
        updatedAt: Date.now()
    };

    Item.findByIdAndUpdate(req.params.id, updateQuery, {new: false}).lean().exec(function (err, item) {
        if (err) {
            res.status(500).json({
                error: "There was a updating the highlight in the database: " + err
            });
        } else {
            res.json({
                success: true
            });
        }
    });
};