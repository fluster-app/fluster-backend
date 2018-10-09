var mongoose = require('mongoose');
var Item = mongoose.model('Item');

module.exports.getMyOfferedItemsLikeStatistics = function (req, res, next) {

    var itemId = req.params.id;

    // select count(likes), count(dislikes) from item where id = myId
    Item.aggregate([{$match: {'_id': new mongoose.Types.ObjectId(itemId)}},
        {
            $project: {
                item: 1,
                likes: {$size: '$likes'},
                dislikes: {$size: '$dislikes'}
            }
        }], function (err, result) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            // Result: [{"_id":"57679edc15def13805e72a48","dislikes":1,"likes":1}]
            res.format({
                json: function () {
                    res.json(result);
                }
            });
        }
    });

};