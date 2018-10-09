var Applicant = require('mongoose').model('Applicant');

var utils = require('../utils/utils');

var constants = require('../../config/constants');

module.exports.getApplicants = function (req, res, next) {
    var limit = constants.LIMIT_QUERY;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    // Prepare the query
    var query = {};

    // Which fields should be populated aka don't return everything about the link user of the item
    var populateFields = [{path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl", options: {lean: true}}, { path: "item", select: "_id user", populate: { path: "user", select: "_id facebook.id google.id facebook.firstName facebook.pictureUrl", options: {lean: true}, options: {lean: true}} }];

    //retrieve all items from Mongo
    Applicant.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).populate(populateFields).exec(function (err, applicants) {
        if (err) {
            res.status(500).json({
                error: "Get users error:" + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(applicants);
                }
            });
        }
    });
};