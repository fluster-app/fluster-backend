const app = module.parent.exports.app;

const securityPolicy = require('../controllers/authentications/securityPolicy');

const getEducationsRoutes = require('../controllers/educations/get-educations');

app.get('/v1/educations/', securityPolicy.authorise, getEducationsRoutes.getEducations);