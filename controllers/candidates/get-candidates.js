const mongoose = require('mongoose');

const CandidatesHelper = require('./candidatesHelper');

const utils = require('../utils/utils');

const constants = require('../../config/constants');

module.exports.getCandidates = (req, res, next) => {
    const userId = req.params.userId || req.body.userId || req.query.userId || null;

    const userIds = new Array();
    userIds.push(new mongoose.Types.ObjectId(userId));

    const limit = constants.LIMIT_QUERY;
    let page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    const candidatesHelper = new CandidatesHelper();

    candidatesHelper.findCandidates(userIds, page, limit, req.query, constants.LIMIT_CANDIDATES).then((users) => {
        res.format({
            json: () => {
                res.json(users);
            }
        });
    }, (err) => {
        res.status(500).json({
            error: "Get users error:" + err
        });
    });
};