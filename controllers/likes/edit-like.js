var Item = require('mongoose').model('Item');

module.exports.like = function(req, res, next) {
    var currentUserId = req.body.userId;

    Item.update({
        _id: req.params.id,
        'likes.user': {$nin: [currentUserId]}
    }, {$push: {likes: {user: currentUserId}}, $pull: {dislikes: {user: currentUserId}}}).lean().exec(function (err, result) {
        processUpdateResults(req, res, err, result);
    });
};

module.exports.dislike = function(req, res, next) {
    var currentUserId = req.body.userId;

    Item.update({
        _id: req.params.id,
        'dislikes.user': {$nin: [currentUserId]}
    }, {$push: {dislikes: {user: currentUserId}}, $pull: {likes: {user: currentUserId}}}).lean().exec(function (err, result) {
        processUpdateResults(req, res, err, result);
    });
};

function processUpdateResults(req, res, err, result) {
    if (err) {
        res.status(500).json({
            error: "There was a problem liking the item in the database: " + err
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