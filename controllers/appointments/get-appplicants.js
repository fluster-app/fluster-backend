var Applicant = require('mongoose').model('Applicant');

var utils = require('../utils/utils');
var constants = require('../../config/constants');

module.exports.getApplicants = function(req, res, next) {
    var itemId = req.query.itemId;
    var appointmentId = req.query.appointmentId;
    
    var query = {
        'item': itemId,
        'appointment': appointmentId
    };

    if (!utils.isStringEmpty(req.query.status)) {
        query["status"] = req.query.status;
    }

    if (!utils.isStringEmpty(req.query.candidateId)) {
        query["user"] = req.query.candidateId;
    }

    var sorting = {status: -1, updatedAt: -1};
    if (!utils.isStringEmpty(req.query.sort) && "selected" === req.query.sort) {
        sorting = {selected: 1};
    }

    var populateFields = new Array();
    if (!utils.isStringEmpty(req.query.populateUser) && "true" === req.query.populateUser) {
        populateFields.push({path: "user", select: "_id google.id facebook.id facebook.firstName facebook.birthday facebook.pictureUrl facebook.location facebook.likes description status", options: {lean: true}}, {path: "item", select: "_id", options: {lean: true}}, {path: "appointment", select: "_id", options: {lean: true}});
    }

    if (!utils.isStringEmpty(req.query.upcoming) && "true" === req.query.upcoming) {
        query["selected"] = {$gte: Date.now()};
    }

    // Pagination. When all things need to be searched, just use null.
    var limit = null;
    var page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        limit = constants.PAGINATION;
        page = parseInt(req.query.pageIndex) * limit;
    }

    Applicant.find(query).lean().sort(sorting).limit(limit).skip(page).populate(populateFields).exec(function (err, applicants) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(applicants);
                }
            });
        }
    });
};

module.exports.getDeeplinkApplicant = function(req, res, next) {
    var itemId = req.query.itemId;
    var userId = req.query.userId;

    Applicant.findOne({
        'item': itemId,
        'user': userId
    }).lean().exec(function (err, applicant) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(applicant);
                }
            });
        }
    });
};