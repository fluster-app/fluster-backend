const app = module.parent.exports.app;

const securityPolicy = require('../controllers/authentications/securityPolicy');

const postRewardsRoutes = require('../controllers/rewards/post-reward');

app.post('/v1/rewards/', securityPolicy.authorise, postRewardsRoutes.createReward);