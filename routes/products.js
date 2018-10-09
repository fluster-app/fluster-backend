var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var getProductsRoutes = require('../controllers/products/get-products');

app.get('/v1/products/', securityPolicy.authorise, getProductsRoutes.getProducts);