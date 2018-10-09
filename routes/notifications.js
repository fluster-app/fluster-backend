var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var postNotificationRoutes = require('../controllers/notifications/post-notification');
var editNotificationRoutes = require('../controllers/notifications/edit-notification');
var getNotificationRoutes = require('../controllers/notifications/get-notifications');

app.get('/v1/notifications/', securityPolicy.authorise, getNotificationRoutes.getUnreadNotifications);

app.post('/v1/notifications/', securityPolicy.authorise, postNotificationRoutes.createNotification);

app.put('/v1/notifications/:id', securityPolicy.authorise, editNotificationRoutes.updateNotification);

app.put('/v1/notifications/:id/superstars', securityPolicy.authorise, editNotificationRoutes.updateSuperstarNotification);