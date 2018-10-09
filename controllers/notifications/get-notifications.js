const Notification = require('mongoose').model('Notification');

const utils = require('../utils/utils');

module.exports.getUnreadNotifications = function(req, res, next) {
    const userId = req.query.userId;
    const types = req.query.types;

    const userTo = req.query.userTo;

    let query = {
        'userTo': !utils.isStringEmpty(userTo) ? userTo : userId,
        'read': false
    };

    if (!utils.isStringEmpty(types)) {
        query["type"] = {"$in": types.split(',')};
    }

    if (!utils.isStringEmpty(req.query.itemId)) {
        query["item"] = req.query.itemId;
    }

    if (!utils.isStringEmpty(req.query.applicantId)) {
        query["applicant"] = req.query.applicantId;
    }

    if (!utils.isStringEmpty(req.query.appointmentId)) {
        query["appointment"] = req.query.appointmentId;
    }

    let populateFields = new Array();
    populateFields.push({path: "userFrom", select: "_id google.id facebook.id facebook.firstName", options: {lean: true}}, {path: "applicant", select: "_id status selected", options: {lean: true}}, {path: "item", select: "_id address", options: {lean: true}});

    Notification.find(query).lean().sort({createdAt: 1}).populate(populateFields).exec(function (err, notifications) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(notifications);
                }
            });
        }
    });
};