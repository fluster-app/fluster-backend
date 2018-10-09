var mongoose = require('mongoose');

var Product = mongoose.model('Product');

var utils = require('../utils/utils');

module.exports.getProducts = function (req, res, next) {

    var query = {
        "validity.from": {$lte: Date.now()}
    };

    if (utils.isNotNull(req.query.browse)) {
        query["browse"] = req.query.browse;
    }

    var fromSubQueries = new Array();
    fromSubQueries.push({"validity.end": {$gte: Date.now()}});
    fromSubQueries.push({"validity.end": null});
    query["$or"] = fromSubQueries;

    Product.find(query).lean().exec(function (err, products) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the products " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(products);
                }
            });
        }
    });
};