const mongoose = require('mongoose');

const Chat = mongoose.model('Chat');

module.exports.postChat = function (req, res, next) {

    const chat = req.body.chat;

    let populateFields = new Array();
    populateFields.push({path: "userItem", select: "_id google.id facebook.id facebook.firstName status", options: {lean: true}}, {path: "userApplicant", select: "_id facebook.id google.id facebook.firstName status", options: {lean: true}});

    Chat.create(chat, (err, createdChat) => {
        if (err) {
            res.status(500).json({
                error: "There was a problem adding the chat into the database."
            });
        } else {
            Chat.findOne({_id: createdChat._id}).lean().populate(populateFields).exec((err, populatedChat) => {
                if (err) {
                    res.status(500).json({
                        error: "There was a problem getting the chat from the database."
                    });
                } else {
                    res.format({
                        json: () => {
                            res.json(populatedChat);
                        }
                    });
                }
            });
        }
    });
};
