const app = module.parent.exports.app;

const securityPolicy = require('../controllers/authentications/securityPolicy');

const getEmployersRoutes = require('../controllers/employers/get-employers');

app.get('/v1/employers/', securityPolicy.authorise, getEmployersRoutes.getEmployers);