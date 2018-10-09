var mongoose = require('mongoose');

var ChatMessage = mongoose.model('ChatMessage');

var socketIOChat = require('./socketio-chat');

module.exports.postChatMessage = function (req, res, next) {

    var userId = req.body.userId;
    var chatId = req.body.chatId;

    var message = req.body.message;

    var socketIOId = req.body.socketIOId;
    var userToId = req.body.userToId;

    var query = {
        userFrom: userId,
        userTo: userToId,
        chat: chatId,
        read: false
    };

    var update = {
        $push: {messages: {message: message}},
        updatedAt: Date.now(),
        push: false,
        $setOnInsert: {
            userFrom: userId,
            userTo: userToId,
            chat: chatId,
            createdAt: Date.now()
        }
    };

    ChatMessage.findOneAndUpdate(query, update, {upsert: true, new: true}).lean().exec(function (err, updatedMessage) {
        if (err) {
            res.status(500).json({
                error: "There was a problem with adding the chat message in the database: " + err
            });
        }
        else {
            socketIOChat.emitSocketIOChatMessage(socketIOId, "chat_new_message", updatedMessage).then(function() {
                res.format({
                    json: function () {
                        res.json(updatedMessage);
                    }
                });
            });
        }
    });
};
