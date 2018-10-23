const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const ItemDetail = mongoose.model('ItemDetail');

module.exports.getItem = function (req, res, next) {

    const populateFields = [{path: "itemDetail", select: "otherPhotos", options: {lean: true}}];

    let query = {
        hashId: req.params.id
    };

    let subQuery = new Array();
    subQuery.push({"status": "published"});
    subQuery.push({"status": "closed"});
    subQuery.push({"status": "cancelled"});
    query["$or"] = subQuery;

    const includeFields = "hashId title mainPhoto source attributes.type attributes.price attributes.rooms attributes.size attributes.sharedRooms attributes.availability.begin attributes.availability.end address.location address.district address.city address.country itemDetail.otherPhotos userLimitations";

    Item.findOne(query).lean().select(includeFields).populate(populateFields).exec(function (err, filteredItem) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(filteredItem);
                }
            });
        }
    });
};

module.exports.getHighlights = function (req, res, next) {

    // https://github.com/Automattic/mongoose/issues/6170
    let match = {
        highlight: true,
        'end': {$gte: new Date()}
    };

    let subQuery = new Array();
    subQuery.push({"status": "published"});
    subQuery.push({"status": "closed"});
    subQuery.push({"status": "cancelled"});
    match["$or"] = subQuery;

    const includeFields = {hashId: true, mainPhoto: true, source: true, itemDetail: true, "attributes.type": true, "attributes.price": true, "attributes.rooms": true, "attributes.size": true, "attributes.sharedRooms": true, "attributes.availability.begin": true, "attributes.availability.end": true, "address.location": true, "address.district": true, "address.city": true, "address.country": true,};

    Item.aggregate([{$match: match}, {$sample: {size: 3}}, {$sort: {createdAt: -1}}, {$project: includeFields}], function (err, items) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the highlights: " + err
            });
        } else {
            // Deep (sub) populate itemDetails
            Item.populate(items, {
                path: "itemDetail",
                model: ItemDetail,
                options: {lean: true},
                select: "otherPhotos"
            }).then(function (deepPopulatedItems) {
                res.format({
                    json: function () {
                        res.json(deepPopulatedItems);
                    }
                });
            }, function (err) {
                res.status(500).json({
                    error: "GET Error: There was a problem populating the highlights: " + err
                });
            });
        }
    });
};