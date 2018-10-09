var mongoose = require('mongoose');
var UserSpotify = mongoose.model('UserSpotify');

var Q = require('q');

var constants = require('../../../config/constants');

var request = require('request');

var moment = require('moment');

var utils = require('../../utils/utils');

function SpotifyHelper() {
    this.findSpotifyToken = findSpotifyToken;
    this.requestSpotifyToken = requestSpotifyToken;
    this.refreshSpotifyToken = refreshSpotifyToken;
    this.findTopArtists = findTopArtists;
    this.saveSpotify = saveSpotify;
}

function findSpotifyToken(spotifyId) {
    var deferred = Q.defer();

    UserSpotify.findOne({'_id': spotifyId}).lean().exec(function (err, userSpotify) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(userSpotify);
        }
    });

    return deferred.promise;
}

function requestSpotifyToken(code, redirectUri) {
    var deferred = Q.defer();

    var spotifyClientId = constants.SPOTIFY_CLIENT_ID;
    var spotifyClientSecret = constants.SPOTIFY_CLIENT_SECRET;

    var authOptions = {
        url: constants.SPOTIFY_TOKEN_URL,
        form: {
            code: code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(spotifyClientId + ':' + spotifyClientSecret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            var access_token = body.access_token;
            var refresh_token = body.refresh_token;

            var tokenExpirationDate = moment(new Date()).add(body.expires_in, 'seconds').toDate();

            deferred.resolve({accessToken: access_token, expire: tokenExpirationDate, refreshToken: refresh_token});
        } else {
            deferred.reject(new Error(error));
        }
    });

    return deferred.promise;
}

function findTopArtists(accessToken) {
    var deferred = Q.defer();

    var options = {
        url: 'https://api.spotify.com/v1/me/top/artists',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    };

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            if (utils.isNotNull(body) && utils.isNotEmpty(body.items)) {

                var results = new Array();

                for (var i = 0, len = body.items.length; i < len; i++) {
                    results.push({
                        id: body.items[i].id,
                        name: body.items[i].name,
                        external_urls: body.items[i].external_urls,
                        images: body.items[i].images,
                        uri: body.items[i].uri,
                        display: true
                    });
                }

                deferred.resolve(results);
            } else {
                deferred.resolve(null);
            }
        } else {
            deferred.reject(new Error(error));
        }
    });

    return deferred.promise;
}

function saveSpotify(userId, token, artists) {
    var deferred = Q.defer();

    var query = {
        user: userId
    };

    var update = {
        token: token,
        artists: artists,
        updatedAt: Date.now(),
        $setOnInsert: {
            user: userId,
            createdAt: Date.now()
        }
    };

    UserSpotify.findOneAndUpdate(query, update, {upsert: true, new: true}).lean().exec(function (err, updatedSpotify) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(updatedSpotify);
        }
    });

    return deferred.promise;
}

function refreshSpotifyToken(refreshToken) {
    var deferred = Q.defer();

    var spotifyClientId = constants.SPOTIFY_CLIENT_ID;
    var spotifyClientSecret = constants.SPOTIFY_CLIENT_SECRET;

    var authOptions = {
        url: constants.SPOTIFY_TOKEN_URL,
        headers: {
            'Authorization': 'Basic ' + (new Buffer(spotifyClientId + ':' + spotifyClientSecret).toString('base64'))
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            var access_token = body.access_token;

            var tokenExpirationDate = moment(new Date()).add(body.expires_in, 'seconds').toDate();

            deferred.resolve({accessToken: access_token, expire: tokenExpirationDate});
        } else {
            deferred.reject(new Error(error));
        }
    });

    return deferred.promise;
}

module.exports = SpotifyHelper;