var mongoose = require('mongoose');
var Q = require('q');

var utils = require('../controllers/utils/utils');

var deviceSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    socketIOId: {type: String, default: null},
    tokenId: {type: String, default: null},
    platform: {
        iOS: {type: Boolean, default: false},
        android: {type: Boolean, default: false}
    },
    language: {type: String, default: 'en'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: {type: Date, default: Date.now}
});

deviceSchema.statics.saveDevice = function(device) {
    var deferred = Q.defer();
    try {
        device.save(function(err, savedDevice) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve(savedDevice);
            }
        });
    }
    catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
};

deviceSchema.statics.findDevice = function(userId) {
    var deferred = Q.defer();
    var query = {
        userId: userId
    };
    Device.findOne(query).lean().sort({expirationDate: -1}).exec(
        function(err, foundDevice) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else if (utils.isNotNull(foundDevice)) {
                deferred.resolve(foundDevice);
            } else {
                deferred.resolve(null);
            }
        }
    );
    return deferred.promise;
};

deviceSchema.statics.findAndUpdateDevice = function(userId, deviceUpdate) {
    var deferred = Q.defer();

    deviceUpdate["updatedAt"] = Date.now();

    Device.findOneAndUpdate({userId: userId}, deviceUpdate, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    }).lean().exec(function (err, updatedDevice) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(updatedDevice);
        }
    });

    return deferred.promise;
};

var Device = mongoose.model('Device', deviceSchema);

module.exports = Device;