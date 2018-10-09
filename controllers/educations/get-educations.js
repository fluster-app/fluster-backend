const fs = require('fs');

const _ = require('underscore');

const Q = require('q');

const utils = require('../utils/utils');

const constants = require('../../config/constants');

module.exports.getEducations = function (req, res, next) {
    const schoolFilter = req.params.school || req.body.school || req.query.school;

    // SRC: https://github.com/Hipo/university-domains-list
    fs.readFile('./config/education/world_universities_and_domains.json', 'utf8', function (err, fileContent) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the educations: " + err
            });
        } else if (utils.isStringEmpty(schoolFilter)) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the educations: At least a param needed"
            });
        } else {
            const data = JSON.parse(fileContent);

            let schoolFilterWithoutAccent = utils.convertAccentFold(schoolFilter);

            const results = _.filter(data, function (school) {
                let schoolWithoutAccent = utils.convertAccentFold(school.name);

                return schoolWithoutAccent.toLowerCase().indexOf(schoolFilterWithoutAccent.toLowerCase()) != -1;
            });

            filterEducations(results).then(function(filterResults) {
                res.format({
                    json: function () {
                        res.json(filterResults);
                    }
                });
            });
        }
    });
};

function filterEducations(results) {
    let deferred = Q.defer();

    if (utils.isNotEmpty(results)) {
        if (results.length > constants.LIMIT_QUERY) {
            results = results.slice(0, constants.LIMIT_QUERY - 1);
        }

        results.forEach(function (school) {
            delete school.web_pages;
            delete school.alpha_two_code;
            delete school['state-province'];
            delete school.domains;
            delete school.country;
        });

        deferred.resolve(results);
    } else {
        deferred.resolve(results);
    }

    return deferred.promise;
}