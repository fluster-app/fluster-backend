const ChatMessage = require('mongoose').model('ChatMessage');

const utils = require('../utils/utils');

const constants = require('../../config/constants');

module.exports.getChatMessages = function(req, res, next) {
    const limit = constants.LIMIT_CHAT_MESSAGES;
    let page = null;
    if (!utils.isStringEmpty(req.query.pageIndex)) {
        page = parseInt(req.query.pageIndex) * limit;
    }

    const chatId = req.query.chatId;

    const query = {
        chat: chatId
    };

    ChatMessage.find(query).lean().sort({createdAt: -1}).limit(limit).skip(page).exec(function (err, messages) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the chat messages: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(messages);
                }
            });
        }
    });
};

module.exports.getUnreadChatMessages = function(req, res, next) {
    const userId = req.query.userId;

    const query = {
        userTo: userId,
        read: false
    };

    // We just populate userItem in case we want to know if user offer or browse
    let populateFields = new Array();
    populateFields.push({path: "chat", select: "userItem", options: {lean: true}});

    ChatMessage.find(query).lean().populate(populateFields).exec(function (err, messages) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving the chat messages: " + err
            });
        } else {
            res.format({
                json: function(){
                    res.json(messages);
                }
            });
        }
    });
};