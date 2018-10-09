var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var getItemsRoutes = require('../controllers/items/get-items');
var postItemsRoutes = require('../controllers/items/post-item');
var editItemsRoutes = require('../controllers/items/edit-item');
var getMyItemsRoutes = require('../controllers/items/get-my-items');
var myOfferedItems = require('../controllers/items/my-offered-items');
var getVoucherItemRoutes = require('../controllers/items/get-voucher-item');

// Items

app.get('/v1/items/', securityPolicy.authorise, getItemsRoutes.getItems);

app.post('/v1/items/', securityPolicy.authorise, postItemsRoutes.createItem);

app.get('/v1/items/:id', securityPolicy.authorise, editItemsRoutes.getPopulatedItem);

app.put('/v1/items/:id', securityPolicy.authorise, editItemsRoutes.editItem);

// My items

app.get('/v1/myitems/', securityPolicy.authorise, getMyItemsRoutes.getMyItems);

// My offered items

app.get('/v1/myoffereditems/', securityPolicy.authorise, myOfferedItems.getMyOfferedItems);

app.put('/v1/myoffereditems/:id/status', securityPolicy.authorise, myOfferedItems.setStatus);

app.put('/v1/myoffereditems/:id/end', securityPolicy.authorise, myOfferedItems.setEnd);

// Voucher items

app.get('/v1/voucheritems/:id', securityPolicy.authorise, getVoucherItemRoutes.getPopulatedVoucherItem);



