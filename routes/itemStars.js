var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var editStarsCtrl = require('../controllers/itemStars/post-itemstar');
var getStarsCtrl = require('../controllers/itemStars/get-itemstars');

app.get('/v1/stars/', securityPolicy.authorise, getStarsCtrl.getStars);
app.post('/v1/stars/', securityPolicy.authorise, editStarsCtrl.star);

app.get('/v1/stars/count', securityPolicy.authorise, getStarsCtrl.countDailyStars);