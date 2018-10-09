var Item = require('mongoose').model('Item');
var ItemStars = require('mongoose').model('ItemStars');

var utils = require('../utils/utils');

module.exports.star = function (req, res, next) {
    var candidateId = req.body.candidateId;
    var itemId = req.body.itemId;

    var query = {
        _id: itemId
    };

    var update = {
        $push: {stars: {user: candidateId}},
        updatedAt: Date.now(),
        $setOnInsert: {
            item: itemId,
            createdAt: Date.now()
        }
    };

    ItemStars.findOneAndUpdate(query, update, {upsert: true, new: true}).lean().exec(function (err, updatedItemStars) {
        if (err) {
            res.status(500).json({
                error: "There was a problem starring the roommate in the database: " + err
            });
        }
        else if (utils.isNotNull(updatedItemStars.stars) && updatedItemStars.stars.length == 1) {
            // If this is the very first star, we should  push the id of the itemStar to the item
            // And in case of, because we want to show the starred item again, we remove the pull in case there is one
            var update = {
                itemStars: updatedItemStars._id,
                $pull: {dislikes: {user: candidateId}},
                updatedAt: Date.now()
            };

            Item.findOneAndUpdate({"_id": itemId}, update).lean().exec(function (err, item) {
                processUpdateResults(req, res, err, updatedItemStars);
            });
        } else {
            // If roommate already disliked the starred item, we gonna remove his dislike to show him again
            Item.update({
                "_id": itemId,
                "dislikes.user": {$in: [candidateId]}
            }, {$pull: {dislikes: {user: candidateId}}}).lean().exec(function (err, item) {
                processUpdateResults(req, res, err, updatedItemStars);
            });
        }
    });
};

function processUpdateResults(req, res, err, result) {
    if (err) {
        res.status(500).json({
            error: "There was a problem update the item for the starred roommate in the database: " + err
        });
    }
    else {
        res.format({
            json: function(){
                res.json(result);
            }
        });
    }
}