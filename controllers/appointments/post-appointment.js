var Appointment = require('mongoose').model('Appointment');
var Item = require('mongoose').model('Item');

module.exports.createAppointment = function(req, res, next) {

    var appointment = req.body.appointment;
    
    Appointment.create(appointment).then(function (dbAppointment) {
        Item.findOneAndUpdate({"_id": dbAppointment.item}, {appointment: dbAppointment._id}, {new: true}).lean().exec(function (err, item) {
            if (err) {
                res.status(500).json({
                    error: "There was a problem updating the item with appointment in the database."
                });
            } else {
                res.format({
                    json: function() {
                        res.json(dbAppointment);
                    }
                });
            }
        });
    }, function (err) {
        res.status(500).json({
            error: "There was a problem adding the appointment into the database."
        });
    });
};