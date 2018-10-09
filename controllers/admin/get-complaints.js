var Complaint = require('mongoose').model('Complaint');

var utils = require('../utils/utils');

var constants = require('../../config/constants');

module.exports.getComplaints = function (req, res, next) {
    var limit = constants.LIMIT_QUERY;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    // Prepare the query
    var query = {};

    var populateFields = [{path: "item", select: "_id hashId", options: {lean: true}}, {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl", options: {lean: true}}, {path: "reporters.user", select: "_id facebook.id facebook.firstName facebook.pictureUrl", options: {lean: true}}];

    Complaint.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).populate(populateFields).exec(function (err, complaints) {
        if (err) {
            res.status(500).json({
                error: "Get complaints error:" + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(complaints);
                }
            });
        }
    });
};
