const User = require('mongoose').model('User');

const utils = require('../utils/utils');

const constants = require('../../config/constants');

module.exports.getEmployers = function (req, res, next) {
    const employerFilter = req.params.employer || req.body.employer || req.query.employer;

    if (utils.isStringEmpty(employerFilter)) {
        res.status(500).json({
            error: "GET Error: There was a problem retrieving the employers: At least a param needed"
        });
    } else {
        const employerFilterRegex = utils.convertAccentRegex(employerFilter);

        const match = {"description.employer": {$regex: employerFilterRegex, $options: "i"}};

        User.aggregate([{$match: match}, {$group:{_id: {"employer": "$description.employer"}}}, { $limit : constants.LIMIT_QUERY }], function (err, results) {
            if (err) {
                res.status(500).json({
                    error: "Get employers error:" + err
                });
            } else {
                res.format({
                    json: function () {
                        res.json(results);
                    }
                });
            }
        });
    }
};