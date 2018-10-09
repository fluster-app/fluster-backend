const Applicant = require('mongoose').model('Applicant');

const utils = require('../utils/utils');

module.exports.getMyApplications = function(req, res, next) {
    const userId = req.query.userId;

    let query = {
        "selected": {$ne:null}
    };

    if (!utils.isStringEmpty(req.query.candidateId)) {
        query["user"] = req.query.candidateId;
    } else {
        query["user"] = userId;
    }

    let subQuery = new Array();
    subQuery.push({"status": "accepted"});
    subQuery.push({"status": "selected"});
    subQuery.push({"status": "rejected"});
    query["$or"] = subQuery;

    const excludeFields = "-agenda -cancellation";

    Applicant.find(query).lean().select(excludeFields).exec(function (err, applicants) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving my applications: " + err
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