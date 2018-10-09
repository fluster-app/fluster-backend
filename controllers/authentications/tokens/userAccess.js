var utils = require('../../utils/utils');

var constants = require('../../../config/constants');

var UserAccess = function(user, apiAccessToken, expirationDate, subscription) {

    this.accessToken = {
        apiAccessToken: apiAccessToken,
        expirationDate: expirationDate,
        userId: user._id,
        googleAuth: utils.isNotNull(user.google)
    };

    // We filter what we want to give back of the user
    this.user = {
        _id: user._id,
        facebook: user.facebook,
        description: user.description,
        updatedAt: user.updatedAt,
        status: user.status
    };

    if (user.google) {
        this.user["google"] = user.google;
    }

    if (user.userParams) {
        this.user["userParams"] = user.userParams;
    }

    this.admin = user.admin;

    this.subscription = utils.isNotNull(subscription) ? {
        end: subscription.end,
        status: subscription.status,
        browse: subscription.browse
    } : null;

    this.freemiumRules = constants.FREEMIUM_RULES;
};

module.exports = UserAccess;
