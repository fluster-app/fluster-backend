var mongoose = require('mongoose');

var Chat = mongoose.model('Chat');

var utils = require('../utils/utils');
var constants = require('../../config/constants');

module.exports.getChats = function (req, res, next) {
    var limit = constants.LIMIT_QUERY;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    var userId = req.query.userId;

    var query = {};

    if (!utils.isStringEmpty(req.query.itemId)) {
        query["item"] = req.query.itemId;
    }

    if (!utils.isStringEmpty(req.query.applicantId)) {
        query["applicant"] = req.query.applicantId;
    }

    var subQuery = new Array();
    subQuery.push({"userItem": userId});
    subQuery.push({"userApplicant": userId});
    query["$or"] = subQuery;

    var populateFields = new Array();
    populateFields.push({path: "userItem", select: "_id google.id facebook.id facebook.firstName status", options: {lean: true}}, {path: "userApplicant", select: "_id facebook.id google.id facebook.firstName status", options: {lean: true}});

    Chat.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).populate(populateFields).exec(function (err, chats) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the chats " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(chats);
                }
            });
        }
    });
};