var YelpHelper = require('./helpers/yelpHelper');

var yelpHelper = new YelpHelper();

module.exports.getBusinesses = function (req, res, next) {

    var longitude = req.query.longitude;
    var latitude = req.query.latitude;
    var locale = req.query.locale;

    yelpHelper.findYelpBusinesses(longitude, latitude, locale).then(function(results) {
        res.json(results);
    }, function(error) {
        res.status(500).json({
            error: "Yelp search query error: " + JSON.stringify(error)
        });
    }).fail(function(err) {
        res.status(500).json({
            error: "Yelp search query fail: " + JSON.stringify(err)
        });
    });
};

module.exports.getBusinessDetails = function (req, res, next) {

    var id = req.params.id;
    var locale = req.query.locale;

    yelpHelper.findYelpBusinessDetails(id, locale).then(function(results) {
        res.json(results);
    }, function(error) {
        res.status(500).json({
            error: "Yelp search query details error: " + JSON.stringify(error)
        });
    }).fail(function(err) {
        res.status(500).json({
            error: "Yelp search query details fail: " + JSON.stringify(err)
        });
    });
};