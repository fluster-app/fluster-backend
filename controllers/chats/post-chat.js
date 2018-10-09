var mongoose = require('mongoose');

var Chat = mongoose.model('Chat');
var User = mongoose.model('User');

module.exports.postChat = function (req, res, next) {

    var chat = req.body.chat;

    var populateFields = new Array();
    populateFields.push({path: "userItem", select: "_id google.id facebook.id facebook.firstName", options: {lean: true}}, {path: "userApplicant", select: "_id facebook.id google.id facebook.firstName", options: {lean: true}});

    Chat.create(chat, function (err, createdChat) {
        if (err) {
            res.status(500).json({
                error: "There was a problem adding the chat into the database."
            });
        } else {
            Chat.findOne({_id: createdChat._id}).lean().populate(populateFields).exec(function(err, populatedChat) {
                if (err) {
                    res.status(500).json({
                        error: "There was a problem getting the chat from the database."
                    });
                } else {
                    res.format({
                        json: function(){
                            res.json(populatedChat);
                        }
                    });
                }
            });
        }
    });
};
