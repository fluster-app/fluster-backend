var Subscription = require('mongoose').model('Subscription');

var utils = require('../utils/utils');

module.exports.getActiveSubscriptions = function(req, res, next) {
    var userIds = req.query.userIds;

    var query = {
        user: {"$in": userIds.split(',')},
        end: {$gte: Date.now()},
        browse: utils.isNotNull(req.query.browse) ? req.query.browse : true
    };

    var statusQuery = new Array();
    statusQuery.push({"status": "acknowledged"});
    statusQuery.push({"status": "active"});

    query["$or"] = statusQuery;

    // Distinct only select field, in this case an array of user id
    Subscription.find(query).distinct("user").exec(function (err, users) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the subscriptions: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(users);
                }
            });
        }
    });
};