const mongoose = require('mongoose');

const Item = mongoose.model('Item');

const logger = require('log4js').getLogger('peterparker');

const utils = require('../controllers/utils/utils');

const constants = require('../config/constants');

const pushCandidatesHelper = require('./helpers/push-candidates-helper');

const moment = require('moment');
const Q = require('q');

module.exports = {
    pushNewCandidates: pushNewCandidates
};

function pushNewCandidates() {

    if (!constants.ARN_IOS_PROD) {
        return;
    }

    const now = new Date();

    let sinceWhen = moment(now).add(-3, 'w').toDate();

    const query = {
        status: 'published',
        createdAt: {$gt: sinceWhen, $lte: now}
    };

    const populateFields = [
        {path: "user", select: "_id userParams facebook.firstName", options: {lean: true}}
    ];

    Item.find(query).lean().populate(populateFields).exec((err, items) => {
        if (err) {
            logger.info('error', 'Error while looking for notifications.');
        } else {
            if (utils.isNotEmpty(items)) {
                const promises = new Array();

                for (let i = 0, len = items.length; i < len; i++) {
                    if (!hasItemNoLimitations(items[i])) {
                        promises.push(hasItemCandidates(items[i]));
                    }
                }

                if (utils.isNotEmpty(promises)) {

                    logger.info("Gonna search candidates for " + promises.length + " items.");

                    Promise.all(promises).then((values) => {
                        if (utils.isNotEmpty(values)) {

                            let loggerCount = 0;

                            for (let i = 0, len = values.length; i < len; i++) {
                                if (values[i].hasCandidates) {
                                    pushCandidatesHelper.sendPushNotification(values[i], 'ITEMS.NEW_CANDIDATES');
                                    loggerCount++;
                                }
                            }

                            logger.info("For " + loggerCount + " items we found potential candidates.");
                        }
                    })
                    .catch((err) => {
                        logger.info('error', 'Error while querying for notifications.');
                    });
                }
            }
        }
    });
}

function hasItemCandidates(item) {
    const deferred = Q.defer();

    const ageMin = item.userLimitations.age.min === 18 ? 18 : getFilterAgeMin(item.userLimitations.age.min);
    const ageMax = item.userLimitations.age.max === 99 ? 99 : getFilterAgeMax(item.userLimitations.age.max);

    pushCandidatesHelper.findCandidates(item, ageMin, ageMax, constants.LIMIT_RECENT_CANDIDATES).then((users) => {
        deferred.resolve({
            item: item,
            hasCandidates: utils.isNotEmpty(users)
        });
    }, function (err) {
        deferred.reject(new Error(err));
    });

    return deferred.promise;
}

function getFilterAgeMin(age) {
    const minAge = age - Math.round(age * 0.1);
    return minAge > 18 ? minAge : 18;
}

function getFilterAgeMax(age) {
    const maxAge = age + Math.round(age * 0.1);
    return maxAge < 99 ? maxAge : 99;
}

function hasItemNoLimitations(item) {
    if (!item || !item.userLimitations) {
        return false;
    }

    const genderIrrelevant = item.userLimitations.gender === 'irrelevant';
    const ageIrrelevant = item.userLimitations.age && item.userLimitations.age.min === 18 && item.userLimitations.age.min === 99;

    return genderIrrelevant && ageIrrelevant;
}
