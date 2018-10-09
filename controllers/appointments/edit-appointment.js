var Appointment = require('mongoose').model('Appointment');

module.exports.getAppointment = function (req, res, next) {
    var id = req.params.id || req.body.id || req.query.id;

    /**
     * TODO: According https://codeandcodes.com/2014/07/31/mongodb-performance-enhancements-and-tweaks/
     * find.limit is faster than findOne or findById
     * but find give back an array not an object
     */
    Appointment.findOne({_id: id}).lean().exec(function (err, appointment) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(appointment);
                }
            });
        }
    });
};

module.exports.updateAppointment = function (req, res, next) {
    var appointmentId = req.params.id;

    var appointment = req.body.appointment;

    appointment.updatedAt = Date.now();

    // Delete to avoid overwrite
    delete appointment.applicant;

    Appointment.findOneAndUpdate({_id: appointmentId}, appointment, {upsert: false, new: true}).lean().exec(function (err, updatedAppointment) {
        if (err) {
            res.status(500).json({
                error: "There was a problem updating the information to the database: " + err
            });
        }
        else {
            res.format({
                json: function () {
                    res.json(updatedAppointment);
                }
            });
        }
    });
};
