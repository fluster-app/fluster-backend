var Item = require('mongoose').model('Item');
var ItemDetail = require('mongoose').model('ItemDetail');

module.exports.getPopulatedVoucherItem = function(req, res, next) {
    // Which fields should be populated aka don't return everything about the link user of the item
    var populateFields = [{path: "itemDetail", options: {lean: true}}, {path: "appointment", options: {lean: true}}];

    Item.findOne({voucher: req.params.id, status: 'initialized'}).lean().populate(populateFields).exec(function(err, item) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the item with a voucher: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(item);
                }
            });
        }
    });
};