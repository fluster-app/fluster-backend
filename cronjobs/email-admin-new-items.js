const mongoose = require('mongoose');

const Item = mongoose.model('Item');

const nodemailer = require('nodemailer');

const logger = require('log4js').getLogger('peterparker');

const moment = require('moment');

const utils = require('../controllers/utils/utils');

var constants = require('../config/constants');

module.exports = {
    sendNewItems: sendNewItems
};

function sendNewItems() {

    if (!constants.ARN_IOS_PROD) {
        return;
    }

    const nowMinus5Minutes = moment(new Date()).add(-5, 'm').toDate();

    const query = {
        createdAt: {$gte: nowMinus5Minutes}
    };

    const populateFields = [
        {path: 'itemDetail', options: {lean: true}}
    ];

    Item.find(query).lean().populate(populateFields).exec(function (err, items) {
        if (err) {
            logger.info('error', 'Error while looking for items to send to admin.');
        } else {
            if (utils.isNotEmpty(items) && items.length > 0) {
                let text = '';

                for (let i = 0, len = items.length; i < len; i++) {
                    text += '<div>';
                    text += '<h2>' + items[i].address.addressName + '</h2>';
                    text += '<p>' + items[i].attributes.type + '</p>';
                    text += '<p>' + items[i].attributes.price.gross + '</p>';

                    const countOtherPhotos = utils.isNotEmpty(items[i].itemDetail.otherPhotos) ? items[i].itemDetail.otherPhotos.length : 0;

                    text += '<p>' + (countOtherPhotos + 1) + ' photos</p>';
                    text += '</div>';
                }

                sendEmail(text);
            }
        }
    });
}

function sendEmail(text) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fluster.cronjobs@gmail.com',
            pass: 'Da293vid49gmail'
        }
    });

    const mailOptions = {
        from: 'fluster.cronjobs@gmail.com',
        to: 'david.dalbusco@gmail.com',
        subject: 'Fluster new item(s)',
        html: text
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            logger.info('error', 'Error email could not be sent ' + err);
        }
    });
}