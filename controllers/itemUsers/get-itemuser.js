var ItemUser = require('mongoose').model('ItemUser');

module.exports.getItemUser = function(req, res, next) {
    var itemId = req.params.id || req.body.id || req.query.id;

    var userId = req.query.userId;

    ItemUser.findOne({
        'user': userId,
        'item': itemId
    }).lean().exec(function (err, itemUser) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(itemUser);
                }
            });
        }
    });
};

module.exports.getItemUsers = function(req, res, next) {
    var userId = req.query.userId;
    var itemIdList = req.query.itemIdList.split(',');

    ItemUser.find({
        'user': userId,
        'item': {$in: itemIdList}
    }).lean().exec(function (err, itemUsers) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(itemUsers);
                }
            });
        }
    });
};