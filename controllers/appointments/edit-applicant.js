const Applicant = require('mongoose').model('Applicant');

const utils = require('../utils/utils');

module.exports.updateApplicant = (req, res, next) => {
    const applicantId = req.params.id;

    let applicant = req.body.applicant;

    applicant.updatedAt = Date.now();

    const populateFields = [{path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl facebook.likes facebook.location facebook.birthday description status", options: {lean: true}}];

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
                json: () => {
                    res.json(applicant);
                }
            });
        }
    });
};

module.exports.statusApplicants = (req, res, next) => {
    const itemId = req.body.itemId;
    const currentStatusList = req.body.currentStatus.split(',');

    const newStatus = req.body.newStatus;

    const applicantId = req.body.applicantId;
    const notApplicantId = req.body.notApplicantId;

    let query = {item: itemId, status: {"$in": currentStatusList}};

    if (!utils.isStringEmpty(applicantId)) {
        query["_id"] = applicantId;
    }

    if (!utils.isStringEmpty(notApplicantId)) {
        query["_id"] = {$ne: notApplicantId};
    }

    Applicant.update(query, {status: newStatus}, { multi: true, upsert: false }).exec((err, result) => {
        if (err) {
            res.status(500).json({
                error: "There was a problem updating the applicants into the database."
            });
        } else {
            res.format({
                json: () => {
                    res.json(result);
                }
            });
        }
    });
};