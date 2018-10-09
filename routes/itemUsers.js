var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var getItemUserRoutes = require('../controllers/itemUsers/get-itemuser');
var postItemUsersRoutes = require('../controllers/itemUsers/post-itemusers');

app.get('/v1/itemusers/:id', securityPolicy.authorise, getItemUserRoutes.getItemUser);

app.get('/v1/itemusers/', securityPolicy.authorise, getItemUserRoutes.getItemUsers);

app.post('/v1/itemusers/', securityPolicy.authorise, postItemUsersRoutes.createItemUser);