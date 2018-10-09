var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var getDeviceRoutes = require('../controllers/devices/get-device');

app.get('/v1/devices/:id', securityPolicy.authorise, getDeviceRoutes.getDeviceSocketId);