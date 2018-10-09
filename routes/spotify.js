var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var postSpotify = require('../controllers/spotify/post-spotify');
var getUserSpotify = require('../controllers/spotify/get-userspotify');
var editUserSpotify = require('../controllers/spotify/edit-userspotify');

app.post('/v1/spotify', securityPolicy.authorise, postSpotify.getAndSaveNewArtists);

app.put('/v1/spotify/:id/refresh', securityPolicy.authorise, postSpotify.refreshArtists);

app.get('/v1/spotify/:id', securityPolicy.authorise, getUserSpotify.getUserSpotify);

app.put('/v1/spotify/:id', securityPolicy.authorise, editUserSpotify.editUserSpotifyArtist);