var mongoose = require('mongoose');

var Notification = mongoose.model('Notification');
var User = mongoose.model('User');
var Applicant = mongoose.model('Applicant');

var Device = require('../../model/device');

var Q = require('q');

var utils = require('../utils/utils');

module.exports.createNotification = function (req, res, next) {

    var notification = req.body.notification;

    Notification.create(notification, function (err, dbNotification) {
        if (err) {
            res.status(500).json({
                error: "There was a problem adding the notification into the database."
            });
        } else if (notification.type !== "superstar_new") {
            // Emit socket
            var populateFields = new Array();
            populateFields.push({path: "userFrom", select: "_id google.id facebook.id facebook.firstName", options: {lean: true}}, {path: "applicant", select: "_id status selected", options: {lean: true}}, {path: "item", select: "_id address", options: {lean: true}});

            Notification.findOne({"_id": dbNotification._id}).lean().populate(populateFields).exec(function (err, deepPopulatedNotification) {
                if (err) {
                    res.status(500).json({
                        error: "Problem populating notification:" + err
                    });
                } else {
                    emitSocketIONotification(deepPopulatedNotification).then(function() {
                        res.format({
                            json: function () {
                                res.json(deepPopulatedNotification);
                            }
                        });
                    });
                }
            });
        } else {
            // Don't emit socket
            res.format({
                json: function () {
                    res.json(dbNotification);
                }
            });
        }
    });
};

function emitSocketIONotification(notification) {
    var deferred = Q.defer();

    Device.findDevice(notification.userTo).then(function (device) {
        if (utils.isNotNull(device) && !utils.isStringEmpty(device.socketIOId)) {
            var socketIO = global.socketIO;
            socketIO.to(device.socketIOId).emit(notification.type, notification);
        }

        // In any case ok
        deferred.resolve();
    }, function(error) {
        // Do nothing

        deferred.resolve();
    });

    return deferred.promise;

}
