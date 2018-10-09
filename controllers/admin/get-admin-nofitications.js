var Notification = require('mongoose').model('Notification');

var utils = require('../utils/utils');

module.exports.getUnreadNotifications = function(req, res, next) {
    var applicantId = req.query.applicantId;
    var types = req.query.types;

    var query = {
        'applicant': applicantId,
        'read': false
    };

    if (!utils.isStringEmpty(types)) {
        query["type"] = {"$in": types.split(',')};
    }

    Notification.find(query).lean().exec(function (err, notifications) {
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