var mongoose = require('mongoose');

var Item = mongoose.model('Item');
var Applicant = mongoose.model('Applicant');

var utils = require('../utils/utils');
var constants = require('../../config/constants');

module.exports.getMyItems = function (req, res, next) {

    var userId = req.query.userId;

    var populateFields = [
        {path: "itemDetail", options: {lean: true}},
        {path: "appointment", options: {lean: true}},
        {path: "user", select: "_id google.id facebook.id facebook.firstName facebook.pictureUrl facebook.birthday facebook.location description.hobbies facebook.lastName facebook.gender", options: {lean: true}},
        {path: "itemStars", options: {lean: true}, match: {'stars.user': {$in: [req.query.userId]}}, select: "_id"}
    ];

    var excludeFields = "-likes -dislikes";

    var bookmarkOnly = !utils.isStringEmpty(req.query.bookmark) && req.query.bookmark == 'true';

    var allStatus = !utils.isStringEmpty(req.query.allStatus) && req.query.allStatus == 'true';

    // Pagination. When all things need to be searched, just use null.
    var limitApplicants = null;
    var pageApplicants = null;
    var limitItems = null;
    var pageItems = null;

    if (!utils.isStringEmpty(req.query.pageIndex)) {
        if (bookmarkOnly) {
            limitItems = constants.PAGINATION;
            pageItems = parseInt(req.query.pageIndex) * limitItems;
        } else {
            limitApplicants = constants.PAGINATION;
            pageApplicants = parseInt(req.query.pageIndex) * limitApplicants;
        }
    }

    // First find applicant corresponding, filter accepted and to_reschedule if we want only "my appointments"
    var applicantQuery = {user: userId};

    var subOrQueries = new Array();

    if (!bookmarkOnly && !allStatus) {
        var subQuery = new Array();
        subQuery.push({"status": "accepted"});
        subQuery.push({"status": "to_reschedule"});
        subQuery.push({"status": "selected"});
        subQuery.push({"status": "rejected"});

        subOrQueries.push({"$or": subQuery});
    }

    if (utils.isNotNull(subOrQueries) && subOrQueries.length >= 1) {
        applicantQuery["$and"] = subOrQueries;
    }

    Applicant.find(applicantQuery).lean().sort({selected: 1}).limit(limitApplicants).skip(pageApplicants).exec(function (errApplicants, applicants) {
        if (errApplicants) {
            res.status(500).json({
                error: "Get items error:" + errApplicants
            });
        } else {
            var itemsIdList = new Array();
            for (var i = 0; i < applicants.length; i++) {
                itemsIdList.push(new mongoose.Types.ObjectId(applicants[i].item));
            }

            var query = {
                'likes.user': {$in: [userId]},
                'dislikes.user': {$nin: [userId]}
            };
            query['_id'] = !bookmarkOnly ? {$in: itemsIdList} : {$nin: itemsIdList};

            var statusQuery = new Array();
            statusQuery.push({"status": "published"});

            if (utils.isStringEmpty(req.query.onlyPublished) || "true" !== req.query.onlyPublished) {
                statusQuery.push({"status": "closed"});
                statusQuery.push({"status": "cancelled"});
            }

            query["$or"] = statusQuery;

            //retrieve all items from Mongo
            Item.find(query).lean().limit(limitItems).skip(pageItems).populate(populateFields).select(excludeFields).exec(function (err, items) {
                if (err) {
                    res.status(500).json({
                        error: "Get items error:" + err
                    });
                } else {
                    // Deep (sub) populate applicant too and filter with user
                    Item.populate(items, {
                        path: "appointment.applicant",
                        match: {"user": userId},
                        model: Applicant,
                        options: {lean: true}
                    }).then(function (deepPopulatedItems) {
                        res.format({
                            json: function () {
                                res.json(deepPopulatedItems);
                            }
                        });
                    }, function (err) {
                        res.status(500).json({
                            error: "Get items error:" + err
                        });
                    });
                }
            });
        }
    });
};
