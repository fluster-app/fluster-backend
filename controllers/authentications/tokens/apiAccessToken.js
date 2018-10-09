var Random = require('./../utils/random');

var constants = require('../../../config/constants');

var moment = require('moment');

var utils = require('../../utils/utils');

var ApiAccessToken = function(userId, application, fbAccessTokenExpiresIn) {
    this.apiAccessToken = Random.generateApiAccessToken();
    this.issueDate = moment();

    if (utils.isNull(fbAccessTokenExpiresIn) || fbAccessTokenExpiresIn <= 0) {
        fbAccessTokenExpiresIn = constants.TOKEN_VALIDITY * 24 * 60 * 60;
    }

    this.expirationDate = moment().add(fbAccessTokenExpiresIn, 's').toISOString();
    this.application = application;
    this.userId = userId;
};

module.exports = ApiAccessToken;
