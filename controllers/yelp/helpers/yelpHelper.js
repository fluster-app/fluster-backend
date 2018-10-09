var Q = require('q');

var constants = require('../../../config/constants');

var request = require('request');

var utils = require('../../utils/utils');

function YelpHelper() {
    this.findYelpBusinesses = findYelpBusinesses;
    this.findYelpBusinessDetails = findYelpBusinessDetails;
}

function findYelpBusinesses(longitude, latitude, locale) {
    var deferred = Q.defer();

    var yelpSearchUrl = constants.YELP_SEARCH_URL + "search";

    var search = {
        limit: constants.YELP_SEARCH_LIMIT,
        radius: constants.YELP_SEARCH_RADIUS,
        sort_by: constants.YELP_SEARCH_SORT,
        longitude: longitude,
        latitude: latitude
    };

    if (!utils.isStringEmpty(locale)) {
        search["locale"] = locale;
    }

    request({
        qs: search,
        url: yelpSearchUrl,
        method: "GET",
        "auth": {
            "bearer": constants.YELP_CLIENT_API_KEY
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var results = JSON.parse(body);

            deferred.resolve(results);
        } else {
            deferred.reject(new Error(error));
        }
    });

    return deferred.promise;
}

function findYelpBusinessDetails(id, locale) {
    var deferred = Q.defer();

    var yelpSearchUrl = constants.YELP_SEARCH_URL + encodeURIComponent(id);

    var search = {};

    if (!utils.isStringEmpty(locale)) {
        search["locale"] = locale;
    }

    request({
        qs: search,
        url: yelpSearchUrl,
        method: "GET",
        "auth": {
            "bearer": constants.YELP_CLIENT_API_KEY
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var results = JSON.parse(body);

            deferred.resolve(results);
        } else {
            deferred.reject(new Error(error));
        }
    });

    return deferred.promise;
}

module.exports = YelpHelper;