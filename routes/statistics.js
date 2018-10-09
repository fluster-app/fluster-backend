var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var statisticsItemUsersLikeRoute = require('../controllers/statistics/get-item-users-like-statistics');

var statisticsTargetedUsersRoute = require('../controllers/statistics/get-targeted-users-statistics');

app.get('/v1/statistics/myoffereditems/:id/countlikes', securityPolicy.authorise, statisticsItemUsersLikeRoute.getMyOfferedItemsLikeStatistics);

app.get('/v1/statistics/targetedusers', securityPolicy.authorise, statisticsTargetedUsersRoute.getTargetedUsersStatistics);
