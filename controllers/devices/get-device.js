var Device = require('../../model/device');

var utils = require('../utils/utils');

module.exports.getDeviceSocketId = function(req, res, next) {
    var searchedUserId = req.params.id;

    Device.findDevice(searchedUserId).then(function (device) {
        res.format({
            json: function(){
                res.json({socketIOId: utils.isNotNull(device) ? device.socketIOId : null});
            }
        });
    }, function(error) {
        res.status(500).json({
            error: "GET Error: There was a problem retrieving the device: " + err
        });
    });
};