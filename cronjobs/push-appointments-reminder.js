const mongoose = require('mongoose');

const Applicant = mongoose.model('Applicant');
const User = mongoose.model('User');

const utils = require('../controllers/utils/utils');

const moment = require('moment');

const pushUsersHelper = require('./helpers/push-users-helper');

const Q = require('q');

const logger = require('log4js').getLogger('peterparker');

module.exports = {
    pushReminder: pushReminder
};

function pushReminder() {

    if (!constants.ARN_IOS_PROD) {
        return;
    }

    const now = new Date();
    const begin = moment(now).startOf('day').toDate();
    const end = moment(now).endOf('day').toDate();

    const query = {
        status: 'accepted',
        selected: {$gte: begin, $lt: end}
    };

    Applicant.aggregate([{$match: query}, {$group: {_id: {user: "$user"}, count: {$sum: 1}}}], (err, applicants) => {
        if (err) {
            logger.info('error', 'Error while looking for applicants.');
        } else if (utils.isNotEmpty(applicants)) {

            // Deep (sub) populate users
            Applicant.populate(applicants, {
                path: "_id.user",
                model: User,
                options: {lean: true},
                select: "_id userParams facebook.firstName"
            }).then(async (deepPopulatedApplicants) => {
                await pushNotifications(deepPopulatedApplicants);
            }, (err) => {
                logger.info('error', 'Error while populating the applicants.');
            });

        }
    });
}

function pushNotifications(deepPopulatedApplicants) {
    const deferred = Q.defer();

    if (utils.isNotEmpty(deepPopulatedApplicants)) {

        logger.info("Gonna try to send new items push notifications to " + deepPopulatedApplicants.length + " users.");

        for (let i = 0, len = deepPopulatedApplicants.length; i < len; i++) {
            if (utils.isNotNull(deepPopulatedApplicants[i]._id) && utils.isNotNull(deepPopulatedApplicants[i]._id.user)) {

                const labelKey = deepPopulatedApplicants[i].count > 1 ? 'REMINDER.TODAY_APPOINTMENTS' : 'REMINDER.TODAY_APPOINTMENT';

                pushUsersHelper.sendPushNotification(deepPopulatedApplicants[i]._id.user, labelKey);
            }
        }

        deferred.resolve();
    } else {
        deferred.resolve();
    }

    return deferred.promise;
}
