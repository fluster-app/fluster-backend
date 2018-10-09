// Public routes

var app = module.parent.exports.app;

var publicItemsRoutes = require('../controllers/items/public-item');

app.get('/v1/public/items/:id', publicItemsRoutes.getItem);

app.get('/v1/public/highlights', publicItemsRoutes.getHighlights);

// TODO #542 REMOVE
app.post('/v1/public/highlights', publicItemsRoutes.getHighlights);