var mongoose = require('mongoose');

var CandidatesHelper = require('./candidatesHelper');

var utils = require('../utils/utils');

var constants = require('../../config/constants');

module.exports.getCandidates = function (req, res, next) {
    var userId = req.params.userId || req.body.userId || req.query.userId || null;

    var userIds = new Array();
    userIds.push(new mongoose.Types.ObjectId(userId));

    var limit = constants.LIMIT_QUERY;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    var candidatesHelper = new CandidatesHelper();

    candidatesHelper.findCandidates(userIds, page, limit, req.query).then(function (users) {
        res.format({
            json: function () {
                res.json(users);
            }
        });
    }, function (err) {
        res.status(500).json({
            error: "Get users error:" + err
        });
    });
};