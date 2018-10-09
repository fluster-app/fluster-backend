var Applicant = require('mongoose').model('Applicant');

var utils = require('../utils/utils');

module.exports.updateApplicant = function (req, res, next) {
    var applicantId = req.params.id;

    var applicant = req.body.applicant;

    applicant.updatedAt = Date.now();

    var populateFields = [{path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl facebook.likes facebook.location facebook.birthday description", options: {lean: true}}];

    Applicant.findOneAndUpdate({_id: applicantId}, applicant, {
        upsert: false,
        new: true
    }).lean().populate(populateFields).exec(function (err, applicant) {
        if (err) {
            res.status(500).json({
                error: "There was a problem updating the information to the database: " + err
            });
        }
        else {
            res.format({
                json: function () {
                    res.json(applicant);
                }
            });
        }
    });
};

module.exports.statusApplicants = function (req, res, next) {
    var itemId = req.body.itemId;
    var currentStatusList = req.body.currentStatus.split(',');

    var newStatus = req.body.newStatus;

    var applicantId = req.body.applicantId;
    var notApplicantId = req.body.notApplicantId;

    var query = {item: itemId, status: {"$in": currentStatusList}};

    if (!utils.isStringEmpty(applicantId)) {
        query["_id"] = applicantId;
    }

    if (!utils.isStringEmpty(notApplicantId)) {
        query["_id"] = {$ne: notApplicantId};
    }

    Applicant.update(query, {status: newStatus}, { multi: true, upsert: false }).exec(function (err, result) {
        if (err) {
            res.status(500).json({
                error: "There was a problem updating the applicants into the database."
            });
        } else {
            res.format({
                json: function () {
                    res.json(result);
                }
            });
        }
    });
};