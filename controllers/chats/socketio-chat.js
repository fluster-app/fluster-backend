var utils = require('../utils/utils');

var Q = require('q');

module.exports = {

    emitSocketIOChatMessage: function emitSocketIOChatMessage(socketIOId, messageTyp, message) {
        var deferred = Q.defer();

        if (!utils.isStringEmpty(socketIOId)) {
            var socketIO = global.socketIO;
            socketIO.to(socketIOId).emit(messageTyp, message);

            deferred.resolve();
        } else {
            // In any case ok
            deferred.resolve();
        }

        return deferred.promise;
    }

};