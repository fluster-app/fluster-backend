var mongoose = require('mongoose');

var appointmentSchema = new mongoose.Schema({
    item: {type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true},
    type: {type: String, enum: ['fixed', 'open'], default: 'fixed'},
    attendance: {type: String, enum: ['multiple', 'single'], default: 'single'},
    approval: {type: String, enum: ['all', 'select'], default: 'select'},
    agenda: {
        type: {type: String, enum: ['time_frame', 'exact']},
        schedule: [{
            when: {type: Date, default: Date.now},
            timeFrame: [{type: String, enum: ['morning', 'afternoon', 'evening']}]
        }]
    },
    applicant: [{type: mongoose.Schema.Types.ObjectId, ref: "Applicant"}],
    createdAt: { type: Date, default: Date.now },
    updatedAt: {type: Date, default: Date.now}
});


var applicantSchema = new mongoose.Schema({
    appointment: {type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref : "User", required: true},
    item: {type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true},
    status: {type: String, enum: ['new', 'accepted', 'cancelled', 'to_reschedule', 'selected', 'rejected']},
    agenda: [{
        when: {type: Date, default: Date.now},
        status: {type: String, enum: ['new', 'accepted', 'cancelled']}
    }],
    selected: {type: Date, default: null},
    cancellation: {
        reason: {type: String, enum: ['not_enough_details', 'no_common_interests', 'found_someone_else', 'no_reason']}
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: {type: Date, default: Date.now}
});

mongoose.model('Appointment', appointmentSchema);
mongoose.model('Applicant', applicantSchema);