var mongoose = require('mongoose');

var chatSchema = new mongoose.Schema({
    item: {type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true},
    applicant: {type: mongoose.Schema.Types.ObjectId, ref: "Applicant", required: true},
    userItem: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    userApplicant: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: {type: Date, default: Date.now}
});

var chatMessageSchema = new mongoose.Schema({
    chat: {type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true},
    userFrom: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    userTo: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    read: {type: Boolean, default: false},
    push: {type: Boolean, default: false},
    messages: [
        {
            message: {type: String, required: true},
            createdAt: {type: Date, default: Date.now},
            updatedAt: {type: Date, default: Date.now}
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: {type: Date, default: Date.now}
});

mongoose.model('Chat', chatSchema);
mongoose.model('ChatMessage', chatMessageSchema);