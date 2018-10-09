var app = module.parent.exports.app;

var securityPolicy = require('../controllers/authentications/securityPolicy');

var yelpBusinesses = require('../controllers/yelp/yelp-businesses');

app.get('/v1/yelp/businesses', securityPolicy.authorise, yelpBusinesses.getBusinesses);

app.get('/v1/yelp/businesses/:id', securityPolicy.authorise, yelpBusinesses.getBusinessDetails);