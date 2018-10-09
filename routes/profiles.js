var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var editProfilesRoutes = require('../controllers/profiles/edit-profiles');

app.get('/v1/profiles/:id', securityPolicy.authorise, editProfilesRoutes.getPublicProfile);

app.put('/v1/profiles/:id/edit', securityPolicy.authorise, editProfilesRoutes.updateProfile);

app.put('/v1/profiles/:id/anonymize', securityPolicy.authorise, editProfilesRoutes.anonymizeProfile);