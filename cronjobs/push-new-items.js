const mongoose = require('mongoose');

const Item = mongoose.model('Item');

const logger = require('log4js').getLogger('peterparker');

const utils = require('../controllers/utils/utils');

const constants = require('../config/constants');

const pushCandidatesHelper = require('./helpers/push-candidates-helper');

const moment = require('moment');
const _ = require('underscore');

module.exports = {
    pushNewItems: pushNewItems
};

function pushNewItems() {

    if (!constants.ARN_IOS_PROD) {
        return;
    }

    const now = new Date();
    const todayAt8am = moment().hours(8).minutes(0).seconds(0).toDate();

    let sinceWhen = moment(now).isBefore(todayAt8am) ? moment(now).add(-8, 'h').toDate() : moment(now).add(-1, 'h').toDate();

    const query = {
        status: 'published',
        createdAt: {$gt: sinceWhen, $lte: now}
    };

    Item.find(query).lean().exec(function (err, items) {
        if (err) {
            logger.info('error', 'Error while looking for notifications.');
        } else {
            if (utils.isNotEmpty(items)) {
                const promises = new Array();

                for (let i = 0, len = items.length; i < len; i++) {
                    const item = items[i];

                    const ageMin = item.userLimitations.age.min;
                    const ageMax = item.userLimitations.age.max;

                    promises.push(pushCandidatesHelper.findCandidates(item, ageMin, ageMax, constants.LIMIT_CANDIDATES));
                }

                Promise.all(promises).then((values) => {

                    const uniqueUsers = _.map(_.groupBy(_.flatten(values), function (doc) {
                        return doc._id;
                    }), function (grouped) {
                        return grouped[0];
                    });

                    if (utils.isNotEmpty(uniqueUsers)) {

                        logger.info("Gonna try to send new items push notifications to " + uniqueUsers.length + " users.");

                        for (let i = 0, len = uniqueUsers.length; i < len; i++) {
                            pushCandidatesHelper.sendPushNotification(uniqueUsers[i], 'ITEMS.NEW_ITEMS');
                        }
                    }
                })
                .catch((err) => {
                    logger.info('error', 'Error while querying for notifications.');
                });
            }
        }
    });
}

