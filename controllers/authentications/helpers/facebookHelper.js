const constants = require('../../../config/constants');

const crypto = require('crypto');

function FacebookHelper() {
    this.getAppSecretProofParam = getAppSecretProofParam;
}

// https://developers.facebook.com/docs/graph-api/securing-requests
// https://developers.facebook.com/tools/api_versioning
function getAppSecretProofParam(token) {
    return '&appsecret_proof=' + crypto.createHmac('sha256', constants.FACEBOOK_APP_SECRET).update(token).digest('hex');
}

module.exports = FacebookHelper;