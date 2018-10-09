var ChatMessage = require('mongoose').model('ChatMessage');

var socketIOChat = require('./socketio-chat');

module.exports.updateChatMessage = function (req, res, next) {
    var messageId = req.params.id;

    var chatMessage = req.body.chatMessage;
    var socketIOId = req.body.socketIOId;

    chatMessage.updatedAt = Date.now();

    ChatMessage.findOneAndUpdate({_id: messageId}, chatMessage, {upsert: false, new: true}).lean().exec(function (err, updatedMessage) {
        if (err) {
            res.status(500).json({
                error: "There was a problem updating the chat message in the database: " + err
            });
        }
        else {
            socketIOChat.emitSocketIOChatMessage(socketIOId, "chat_update_message", updatedMessage).then(function() {
                res.format({
                    json: function () {
                        res.json(updatedMessage);
                    }
                });
            });
        }
    });
};