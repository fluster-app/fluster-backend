var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var getSubscriptionRoutes = require('../controllers/subscriptions/get-subscriptions');
var postSubscriptionRoutes = require('../controllers/subscriptions/post-subscription');

app.post('/v1/subscriptions/', securityPolicy.authorise, postSubscriptionRoutes.createSubscription);
app.get('/v1/subscriptions/', securityPolicy.authorise, getSubscriptionRoutes.getActiveSubscriptions);