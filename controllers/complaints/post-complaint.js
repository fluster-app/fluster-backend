var Complaint = require('mongoose').model('Complaint');

var utils = require('../utils/utils');

module.exports.createItemComplaint = function (req, res, next) {

    var itemId = req.body.itemId;
    var currentUserId = req.body.userId;

    var update = getCommonUpdateQuery(currentUserId, req.body.reason);

    update["item"] = itemId;

    Complaint.findOneAndUpdate({item: itemId}, update, {upsert: true, new: true}).lean().exec(function (err, complaint) {
        if (err) {
            res.status(500).json({
                error: "There was a problem with the complaint in the database: " + err
            });
        }
        else {
            res.format({
                json: function () {
                    res.json({complaintProcessed: true});
                }
            });
        }
    });
};

module.exports.createUserComplaint = function (req, res, next) {

    var complaintUserId = req.body.complaintUserId;
    var currentUserId = req.body.userId;

    var update = getCommonUpdateQuery(currentUserId, req.body.reason);

    update["user"] = complaintUserId;

    Complaint.findOneAndUpdate({user: complaintUserId}, update, {upsert: true, new: true}).lean().exec(function (err, complaint) {
        if (err) {
            res.status(500).json({
                error: "There was a problem with the complaint in the database: " + err
            });
        }
        else {
            res.format({
                json: function () {
                    res.json({complaintProcessed: true});
                }
            });
        }
    });
};

function getCommonUpdateQuery(currentUserId, reason) {
    var update = {
        $push: {reporters: {user: currentUserId}},
        updatedAt: Date.now(),
        $setOnInsert: { createdAt: Date.now(), processed: false }
    };

    if (!utils.isStringEmpty(reason)) {
        update["$push"] = {
            reporters: {
                user: currentUserId,
                reason: reason
            }
        };
    }

    return update;
}