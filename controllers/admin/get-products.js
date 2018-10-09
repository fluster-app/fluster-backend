var Product = require('mongoose').model('Product');

var utils = require('../utils/utils');

var constants = require('../../config/constants');

module.exports.getProducts = function (req, res, next) {
    var limit = constants.LIMIT_QUERY;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    // Prepare the query
    var query = {};

    //retrieve all products from Mongo
    Product.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).exec(function (err, products) {
        if (err) {
            res.status(500).json({
                error: "Get users error:" + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(products);
                }
            });
        }
    });
};