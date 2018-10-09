var ItemUser = require('mongoose').model('ItemUser');

module.exports.createItemUser = function(req, res, next) {

    var itemUser = req.body.itemUser;

    ItemUser.create(itemUser, function (err, itemUser) {
        if (err) {
            res.status(500).json({
                error: "There was a problem adding the item interest into the database."
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