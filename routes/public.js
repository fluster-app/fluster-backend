// Public routes

const app = module.parent.exports.app;

const publicItemsRoutes = require('../controllers/items/public-item');

app.get('/v1/public/items/:id', publicItemsRoutes.getItem);

app.get('/v1/public/highlights', publicItemsRoutes.getHighlights);
