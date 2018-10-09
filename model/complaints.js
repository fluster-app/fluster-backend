let mongoose = require('mongoose');

// A complaint could be about an item or a user
const complaintSchema = new mongoose.Schema({
    item: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    reporters: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        at: {type: Date, default: Date.now},
        reason: {type: String, enum: ['inappropriate', 'fake', 'didnt_show_up'], default: 'fake'}
    }],
    processed: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

mongoose.model('Complaint', complaintSchema);