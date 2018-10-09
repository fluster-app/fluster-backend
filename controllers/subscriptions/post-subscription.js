var mongoose = require('mongoose');

var Subscription = mongoose.model('Subscription');
var Product = mongoose.model('Product');

var moment = require('moment');

var utils = require('../utils/utils');

module.exports.createSubscription = function (req, res, next) {

    var userId = req.body.userId || req.param('userId');

    var productId = req.body.productId;

    Product.findOne({_id: productId}).lean().exec(function(err, product) {
        if (err) {
            res.status(500).json({
                error: "Error: The product doesn't seems to exist: " + err
            });
        } else {
            var end;
            if (product.duration.type === 'days') {
                end = moment(Date.now()).add(product.duration.duration, 'd').toDate();
            } else {
                end = moment(Date.now()).add(product.duration.duration, 'M').toDate();
            }

            var userTo = !utils.isStringEmpty(req.body.subscriptionUserId) ? req.body.subscriptionUserId : req.body.userId;

            var status = !utils.isStringEmpty(req.body.status) ? req.body.status : 'initialized';

            var browse = product.browse;

            var subscription = {
                product: product,
                user: userTo,
                end: moment(end).endOf('day').toDate(),
                status: status,
                browse: browse
            };

            Subscription.create(subscription, function (err, createdSubscription) {
                if (err) {
                    res.status(500).json({
                        error: "There was a problem adding the subscription into the database."
                    });
                } else {
                    res.format({
                        json: function(){
                            res.json(createdSubscription);
                        }
                    });
                }
            });
        }
    });
};
