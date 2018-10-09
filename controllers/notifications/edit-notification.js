var Notification = require('mongoose').model('Notification');

module.exports.updateNotification = function (req, res, next) {
    var notificationId = req.params.id;

    var notification = req.body.notification;

    notification.updatedAt = Date.now();

    Notification.findOneAndUpdate({_id: notificationId}, notification, {upsert: false, new: true}).lean().exec(function (err, notification) {
        if (err) {
            res.status(500).json({
                error: "There was a problem updating the information to the database: " + err
            });
        }
        else {
            res.format({
                json: function () {
                    res.json(notification);
                }
            });
        }
    });
};

module.exports.updateSuperstarNotification = function (req, res, next) {
    var itemId = req.params.id;

    var currentUserId = req.body.userId;

    var query = {
        item: itemId,
        userTo: currentUserId,
        type: "superstar_new",
        read: false
    };

    var updateQuery = {
        read: true,
        updatedAt: Date.now()
    };

    Notification.findOneAndUpdate(query, updateQuery, {upsert: false, new: true}).lean().exec(function (err, notification) {
        if (err) {
            res.status(500).json({
                error: "There was a problem updating the information to the database: " + err
            });
        }
        else {
            res.format({
                json: function () {
                    res.json(notification);
                }
            });
        }
    });
};