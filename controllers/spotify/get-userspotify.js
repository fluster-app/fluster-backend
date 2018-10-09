var SpotifyHelper = require('./helpers/spotifyHelper');

var spotifyHelper = new SpotifyHelper();

var utils = require('../utils/utils');

module.exports.getUserSpotify = function(req, res, next) {
    var spotifyId = req.params.id || req.body.id || req.query.id;

    spotifyHelper.findSpotifyToken(spotifyId).then(function(userSpotify) {
        if (utils.isNull(userSpotify)) {
            res.format({
                json: function(){
                    res.json({});
                }
            });
        } else {
            // We don't want to send the token back
            delete userSpotify.token;

            res.format({
                json: function(){
                    res.json(userSpotify);
                }
            });
        }
    }, function(error) {
        res.status(500).json({
            error: "Spotify get user spotify error: " + JSON.stringify(error)
        });
    }).fail(function(err) {
        res.status(500).json({
            error: "Spotify get user spotify fail: " + JSON.stringify(err)
        });
    });
};