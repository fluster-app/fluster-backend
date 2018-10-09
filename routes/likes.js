var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var getLikesRoutes = require('../controllers/likes/get-like');
var editLikeRoutes = require('../controllers/likes/edit-like');

app.get('/v1/likes/:id/like', securityPolicy.authorise, getLikesRoutes.getLike);
app.get('/v1/likes/:id/dislike', securityPolicy.authorise, getLikesRoutes.getDisLike);

app.put('/v1/likes/:id/like', securityPolicy.authorise, editLikeRoutes.like);
app.put('/v1/likes/:id/dislike', securityPolicy.authorise, editLikeRoutes.dislike);

app.get('/v1/likes/count', securityPolicy.authorise, getLikesRoutes.countDailyLikes);