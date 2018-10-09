const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userTo: {type: mongoose.Schema.Types.ObjectId, ref : "User", required: true},
    userFrom: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    item: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
    appointment: {type: mongoose.Schema.Types.ObjectId, ref: "Appointment"},
    applicant: {type: mongoose.Schema.Types.ObjectId, ref: "Applicant"},
    type: {type: String, enum: ['application_new', 'application_accepted', 'application_to_reschedule', 'superstar_new', 'appointment_rescheduled'], required: true},
    read: {type: Boolean, default: false},
    push: {type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now },
    updatedAt: {type: Date, default: Date.now}
});

mongoose.model('Notification', notificationSchema);