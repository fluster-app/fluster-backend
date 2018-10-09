var UserSpotify = require('mongoose').model('UserSpotify');

module.exports.editUserSpotifyArtist = function (req, res, next) {
    var userSpotifyId = req.params.id;

    var artistObjectId = req.body.artistObjectId;
    var displayArtist = req.body.displayArtist;

    var query = {
      _id: userSpotifyId,
      'artists._id': artistObjectId
    };

    var updateQuery = {
        'artists.$.display': displayArtist,
        updatedAt: Date.now()
    };

    UserSpotify.update(query, {'$set': updateQuery}, {new: false, upsert: false}).lean().exec(function (err, result) {
        if (err) {
            res.status(500).json({
                error: "There was a updating the status in the database: " + err
            });
        } else {
            res.json(result);
        }
    });
};