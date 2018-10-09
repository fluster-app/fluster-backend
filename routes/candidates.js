var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var getCandidatesCtrl = require('../controllers/candidates/get-candidates');

app.get('/v1/candidates/', securityPolicy.authorise, getCandidatesCtrl.getCandidates);