const Reward = require('mongoose').model('Reward');

const utils = require('../utils/utils');

const constants = require('../../config/constants');

module.exports.getRewards = function (req, res, next) {
    const limit = constants.LIMIT_QUERY;
    let page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    const query = {};

    const populateFields = [{path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl", options: {lean: true}}, {path: "prize", options: {lean: true}}, {path: "item", select: "_id status updatedAt", options: {lean: true}}];

    Reward.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).populate(populateFields).exec(function (err, rewards) {
        if (err) {
            res.status(500).json({
                error: "Get chat msgs error:" + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(rewards);
                }
            });
        }
    });
};