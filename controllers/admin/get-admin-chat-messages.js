var ChatMessage = require('mongoose').model('ChatMessage');

var utils = require('../utils/utils');

var constants = require('../../config/constants');

module.exports.getChatMessages = function (req, res, next) {
    var limit = constants.LIMIT_QUERY;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    // Prepare the query
    var query = {};

    // Which fields should be populated aka don't return everything about the link user of the item
    var populateFields = [{path: "userFrom", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl", options: {lean: true}}, {path: "userTo", select: "_id facebook.id google.id facebook.firstName facebook.pictureUrl", options: {lean: true}}];

    //retrieve all items from Mongo
    ChatMessage.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).populate(populateFields).exec(function (err, msgs) {
        if (err) {
            res.status(500).json({
                error: "Get chat msgs error:" + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(msgs);
                }
            });
        }
    });
};