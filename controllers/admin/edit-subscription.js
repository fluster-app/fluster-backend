var mongoose = require('mongoose'); //mongo connection

var Subscription = mongoose.model('Subscription');

var utils = require('../utils/utils');

module.exports.setSubscriptionStatus = function (req, res, next) {

    var status = utils.isStringEmpty(req.body.newStatus) || req.body.newStatus !== 'acknowledged' ? 'rejected' : 'acknowledged';

    var updateQuery = {
        status: status,
        updatedAt: Date.now()
    };

    var populateFields = [{path: "product", options: {lean: true}}, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.lastName facebook.pictureUrl", options: {lean: true}}];

    Subscription.findByIdAndUpdate(req.params.id, updateQuery, {new: true}).lean().populate(populateFields).exec(function (err, subscription) {
        if (err) {
            res.status(500).json({
                error: "There was a problem editing the subscription's status in the database: " + err
            });
        }
        else {
            res.format({
                json: function () {
                    res.json(subscription);
                }
            });
        }
    });
};