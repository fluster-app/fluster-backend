var Appointment = require('mongoose').model('Appointment');
var Applicant = require('mongoose').model('Applicant');

module.exports.createApplicant = function(req, res, next) {

    var applicant = req.body.applicant;

    Applicant.create(applicant, function (err, applicant) {
        if (err) {
            res.status(500).json({
                error: "There was a problem adding the applicant into the database."
            });
        } else {
            Appointment.findOneAndUpdate({"_id": applicant.appointment}, {$push: {applicant: applicant._id}}, {new: true}).lean().exec(function (err, appointment) {
                if (err) {
                    res.status(500).json({
                        error: "There was a problem updating the appointment with applicant in the database."
                    });
                } else {
                    res.format({
                        json: function(){
                            res.json(applicant);
                        }
                    });
                }
            });
        }
    });
};