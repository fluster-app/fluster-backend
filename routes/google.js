var app = module.parent.exports.app;

var https = require('https');

var securityPolicy = require('../controllers/authentications/securityPolicy');

var constants = require('../config/constants');

var utils = require('../controllers/utils/utils');

app.post('/v1/google/searchPlaceNearby', securityPolicy.authorise, function (req, res) {

    var key = constants.GOOGLE_API_KEY;
    var googlePlaceApiUrl = constants.GOOGLE_API_PLACE_NEARBY_URL;

    var nextTo = req.body.nextTo;
    var radius = req.body.radius;
    var types = req.body.type;
    var keyword = req.body.keyword;

    var url = googlePlaceApiUrl + "?" + "key=" + key + "&location=" + nextTo + "&radius=" + radius + "&types=" + types + "&keyword=" + keyword;

    https.get(url, function(response) {
        var body ='';
        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            var places = JSON.parse(body);

            // To send back only first result
            //var randLoc = locations[Math.floor(Math.random() * locations.length)];

            // Place nearby give places
            res.json(places);
        });
    }).on('error', function(error) {
        res.status(500).json({
            error: "Google places error: " + JSON.stringify(error)
        });
    });
});

// https://developers.google.com/places/web-service/autocomplete
app.post('/v1/google/searchPlace', securityPolicy.authorise, function (req, res) {

    var key = constants.GOOGLE_API_KEY;
    var googlePlaceApiUrl = constants.GOOGLE_API_PLACE_AUTOCOMPLETE_URL;

    var input = req.body.input;

    var url = googlePlaceApiUrl + "?" + "key=" + key + "&input=" + input;

    if (!utils.isStringEmpty(req.body.type)) {
        var types = req.body.type;
        url += "&types=" + types;
    }

    if (!utils.isStringEmpty(req.body.nextTo)) {
        var nextTo = req.body.nextTo;
        url += "&location=" + nextTo;
    }

    if (!utils.isStringEmpty(req.body.radius)) {
        var radius = req.body.radius;
        url += "&radius=" + radius;
    }

    https.get(url, function(response) {
        var body ='';
        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            var places = JSON.parse(body);

            // Autocomplete give predictions without lat/lng
            res.json(places);
        });
    }).on('error', function(error) {
        res.status(500).json({
            error: "Google places error: " + JSON.stringify(error)
        });
    });
});

// https://developers.google.com/places/web-service/details
app.post('/v1/google/placeDetails', securityPolicy.authorise, function (req, res) {

    var key = constants.GOOGLE_API_KEY;
    var googlePlaceApiUrl = constants.GOOGLE_API_PLACE_DETAILS_URL;

    var placeId = req.body.placeId;

    var url = googlePlaceApiUrl + "?" + "key=" + key + "&placeid=" + placeId;

    https.get(url, function(response) {
        var body ='';
        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            var result = JSON.parse(body);

            res.json(result);
        });
    }).on('error', function(error) {
        res.status(500).json({
            error: "Google places error: " + JSON.stringify(error)
        });
    });
});
