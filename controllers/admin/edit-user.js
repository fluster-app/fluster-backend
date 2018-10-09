var mongoose = require('mongoose'); //mongo connection

var User = mongoose.model('User');

var SecurityToken = require('./../../model/securityToken');

module.exports.blockUser = function (req, res, next) {

    var updateQuery = {
        status: 'blocked',
        blocked: true,
        updatedAt: Date.now()
    };

    User.findByIdAndUpdate(req.params.id, updateQuery, {new: false}).lean().exec(function (err, updatedUser) {
        if (err) {
            res.status(500).json({
                error: "There was a updating the status in the database: " + err
            });
        } else {
            SecurityToken.removeSecurityTokensForUserId(req.params.id)
                .then(function(apiAccessToken) {
                    res.json({
                        success: true
                    });
                }, function(err) {
                    res.status(500).json({
                        error: "The tokens couldn't be removed from the database: " + err
                    });
                });
        }
    });
};