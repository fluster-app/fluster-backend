var SpotifyHelper = require('./helpers/spotifyHelper');

var spotifyHelper = new SpotifyHelper();

var utils = require('../utils/utils');

module.exports.getAndSaveNewArtists = function (req, res, next) {

    var userId = req.body.userId;

    var code = req.body.code;
    var redirectUri = req.body.redirectUri;

    spotifyHelper.requestSpotifyToken(code, redirectUri).then(function(spotifyToken) {
        spotifyHelper.findTopArtists(spotifyToken.accessToken).then(function(spotifyTopArtists) {
            spotifyHelper.saveSpotify(userId, spotifyToken, spotifyTopArtists).then(function(savedSpotifyUser) {
                res.json({userSpotifyId: savedSpotifyUser._id});
            }, function(error) {
                res.status(500).json({
                    error: "Spotify save spotify error: " + JSON.stringify(error)
                });
            }).fail(function(err) {
                res.status(500).json({
                    error: "Spotify save spotify fail: " + JSON.stringify(err)
                });
            });
        }, function(error) {
            res.status(500).json({
                error: "Spotify top artists error: " + JSON.stringify(error)
            });
        }).fail(function(err) {
            res.status(500).json({
                error: "Spotify top artists fail: " + JSON.stringify(err)
            });
        });
    }, function(error) {
        res.status(500).json({
            error: "Spotify token error: " + JSON.stringify(error)
        });
    }).fail(function(err) {
        res.status(500).json({
            error: "Spotify token fail: " + JSON.stringify(err)
        });
    });
};

module.exports.refreshArtists = function (req, res, next) {

    var userSpotifyId = req.params.id;

    var userId = req.body.userId;

    spotifyHelper.findSpotifyToken(userSpotifyId).then(function(userSpotify) {
        if (utils.isNull(userSpotify)) {
            res.status(500).json({
                error: "Spotify find is null"
            });
        } else {
            if (userSpotify.token.expire.getTime() > new Date().getTime()) {
                // We don't need to refresh the token
                spotifyHelper.findTopArtists(userSpotify.token.accessToken).then(function(spotifyTopArtists) {
                    spotifyHelper.saveSpotify(userId, userSpotify.token, spotifyTopArtists).then(function(savedSpotifyUser) {
                        res.json({userSpotifyId: savedSpotifyUser._id});
                    }, function(error) {
                        res.status(500).json({
                            error: "Spotify save spotify error: " + JSON.stringify(error)
                        });
                    }).fail(function(err) {
                        res.status(500).json({
                            error: "Spotify save spotify fail: " + JSON.stringify(err)
                        });
                    });
                }, function(error) {
                    res.status(500).json({
                        error: "Spotify top artists error: " + JSON.stringify(error)
                    });
                }).fail(function(err) {
                    res.status(500).json({
                        error: "Spotify top artists fail: " + JSON.stringify(err)
                    });
                });
            } else {
                // We need to refresh the token
                spotifyHelper.refreshSpotifyToken(userSpotify.token.refreshToken).then(function(newSpotifyToken) {

                    var spotifyToken = userSpotify.token;
                    spotifyToken.accessToken = newSpotifyToken.accessToken;
                    spotifyToken.expire = newSpotifyToken.expire;
                    // resfresh_token stay the same

                    spotifyHelper.findTopArtists(spotifyToken.accessToken).then(function(spotifyTopArtists) {
                        spotifyHelper.saveSpotify(userId, spotifyToken, spotifyTopArtists).then(function(savedSpotifyUser) {
                            res.json({userSpotifyId: savedSpotifyUser._id});
                        }, function(error) {
                            res.status(500).json({
                                error: "Spotify save spotify error: " + JSON.stringify(error)
                            });
                        }).fail(function(err) {
                            res.status(500).json({
                                error: "Spotify save spotify fail: " + JSON.stringify(err)
                            });
                        });
                    }, function(error) {
                        res.status(500).json({
                            error: "Spotify top artists error: " + JSON.stringify(error)
                        });
                    }).fail(function(err) {
                        res.status(500).json({
                            error: "Spotify top artists fail: " + JSON.stringify(err)
                        });
                    });
                }, function(error) {
                    res.status(500).json({
                        error: "Spotify token error: " + JSON.stringify(error)
                    });
                }).fail(function(err) {
                    res.status(500).json({
                        error: "Spotify token fail: " + JSON.stringify(err)
                    });
                });
            }
        }
    }, function(error) {
        res.status(500).json({
            error: "Spotify find: " + JSON.stringify(error)
        });
    }).fail(function(err) {
        res.status(500).json({
            error: "Spotify find: " + JSON.stringify(err)
        });
    });
};

