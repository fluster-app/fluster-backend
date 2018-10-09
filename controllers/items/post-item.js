var Item = require('mongoose').model('Item');
var ItemDetail = require('mongoose').model('ItemDetail');

var constants = require('../../config/constants');

var Hashids = require("hashids");

var moment = require('moment');

var utils = require('../utils/utils');

var logger = require('log4js').getLogger('peterparker');

module.exports.createItem = function (req, res, next) {
    // Get values from POST request. These can be done through forms or REST calls. These rely on the "title" attributes for forms
    var title = req.body.newItem.title;
    var address = req.body.newItem.address;
    var source = req.body.newItem.source;
    var sourceId = req.body.newItem.sourceId || '';
    var mainPhoto = req.body.newItem.mainPhoto;

    var newItemDetail = req.body.newItem.itemDetail || {};

    var attributes = req.body.newItem.attributes || null;
    var userLimitations = req.body.newItem.userLimitations || null;

    var userId = req.body.newItem.user;

    if (utils.isStringEmpty(userId)) {
        logger.info('Post item: user was empty, setting userId instead (' + req.body.userId + ')');
        userId = req.body.userId;
    }

    var today = moment(new Date()).startOf('day').toDate();
    var expirationDate = moment(today).add(constants.ITEM_DURATION, 'd').toDate();

    var voucher = req.body.newItem.voucher || null;

    Item.create({
        title: title,
        address: address,
        end: expirationDate,
        source: source,
        sourceId: sourceId,
        attributes: attributes,
        userLimitations: userLimitations,
        mainPhoto: mainPhoto,
        status: 'new',
        user: userId,
        voucher: voucher
    }).then(function (item) {
        //Item has been created

        var itemDetailToAdd = new ItemDetail(newItemDetail);
        itemDetailToAdd.save(function (err) {
            if (err) {
                res.status(500).json({
                    error: "Save Error: ItemDetail couldn't be saved " + err
                });
            } else {

                item.itemDetail = itemDetailToAdd._id;

                // Node side: https://github.com/ivanakimov/hashids.js
                // Client side: https://github.com/ivanakimov/hashids.js
                var hashids = new Hashids("giancarlo et berta salt", 8, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
                item.hashId = hashids.encodeHex(item._id);

                item.save(function (err) {
                    if (err) {
                        res.status(500).json({
                            error: "Save Error: Item couldn't be updated " + err
                        });
                    } else {
                        res.format({
                            json: function () {
                                res.json(item);
                            }
                        });
                    }
                });
            }
        });

    }, function (err) {
        res.status(500).json({
            error: "There was a problem adding the information to the database."
        });
        
    });
};
