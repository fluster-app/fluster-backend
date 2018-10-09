var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var postComplaintsRoutes = require('../controllers/complaints/post-complaint');

app.post('/v1/complaints/item', securityPolicy.authorise, postComplaintsRoutes.createItemComplaint);
app.post('/v1/complaints/user', securityPolicy.authorise, postComplaintsRoutes.createUserComplaint);