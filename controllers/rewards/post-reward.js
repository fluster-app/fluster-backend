const mongoose = require('mongoose');

const Reward = mongoose.model('Reward');

const PrizeHelper = require('./helpers/prizeHelper');
const prizeHelper = new PrizeHelper();

const utils = require('../utils/utils');

module.exports.createReward = function (req, res, next) {

    const itemType = req.body.itemType;

    prizeHelper.findActivePrizes(false, itemType).then(function (prizes) {
        if (!utils.isNotEmpty(prizes)) {
            res.format({
                json: function () {
                    res.json(null);
                }
            });
        } else {

            const itemId = req.body.itemId;
            const userId = req.body.userId;

            // Right now only contest, we only gonna have one contest often at the time
            // Should change in case of welcoming package/gift selection
            const prize = prizes[0];

            const reward = {
                user: userId,
                item: itemId,
                prize: prize._id
            };

            Reward.create(reward, function (err, createdReward) {
                if (err || utils.isNull(createdReward)) {
                    res.status(500).json({
                        error: "There was a problem adding the reward into the database " + err
                    });
                } else {
                    // Avoid another populate
                    const resultReward = {
                        _id: createdReward._id,
                        prize: prize
                    };

                    res.format({
                        json: function () {
                            res.json(resultReward);
                        }
                    });
                }
            });
        }
    }, function(error) {
        res.status(500).json({
            error: "Reward create error: " + JSON.stringify(error)
        });
    }).fail(function(err) {
        res.status(500).json({
            error: "Reward create fail: " + JSON.stringify(err)
        });
    });
};
