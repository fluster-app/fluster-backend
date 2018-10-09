var Device = require('../model/device');

var utils = require('../controllers/utils/utils');

module.exports = function (app, server) {
    var socketIO = require('socket.io').listen(server, {'transports': ['websocket', 'xhr-polling']});
    global.socketIO = socketIO;

    socketIO.set('origins', '*:*');

    // Secure Socket.io access. If doesn't succeed, Socket.io connect won't work.
    socketIO.use(function (socket, next) {
        if (!utils.isNotNull(socket.handshake.query)) {
            next(new Error("not authorized"));
        } else {
            var apiAccessToken = socket.handshake.query.apiAccessToken;
            var userId = socket.handshake.query.userId;

            if (!utils.isNotNull(apiAccessToken) || !utils.isNotNull(userId)) {
                next(new Error("not authorized"));
            } else {
                Device.findAndUpdateDevice(userId, {socketIOId: socket.id}).then(function (updatedDevice) {
                    socketIO.emit("device_update", {user: updatedDevice.userId, socketIOId: updatedDevice.socketIOId});
                    next();
                }, function(error) {
                    next(error);
                });
            }
        }
    });

    socketIO.sockets.on('connection', function (socket) {

        socket.on('disconnect', function () {
            // Nothing special to do. Next login gonna create a new key token/socket id
        });

    });

};
