const mongoose = require('mongoose'); //mongo connection

const User = mongoose.model('User');
const UserInterests = mongoose.model('UserInterests');

const UserAccess = require('../authentications/tokens/userAccess');

const constants = require('../../config/constants');

const moment = require('moment');

const utils = require('../utils/utils');

module.exports.getPublicProfile = function (req, res, next) {
    const id = req.params.id || req.body.id || req.query.id;

    const includeFields = "_id google.id facebook.id facebook.firstName facebook.birthday facebook.pictureUrl facebook.location facebook.likes description facebook.lastName facebook.gender";

    User.findOne({_id: id}).lean().select(includeFields).exec(function (err, user) {
        if (err) {
            res.status(500).json({
                error: "GET Error: There was a problem retrieving: " + err
            });
        } else {
            res.format({
                json: function () {
                    res.json(user);
                }
            });
        }
    });
};

module.exports.updateProfile = function (req, res, next) {
    let bodyUserParams = req.body.userParams;

    const apiAccessToken = req.body.apiAccessToken;

    const newStatus = req.body.newStatus;
    const description = req.body.description;
    const gender = req.body.gender;
    const birthday = req.body.birthday;

    bodyUserParams.updatedAt = Date.now();

    const interests = bodyUserParams.interests;
    delete bodyUserParams.interests;
    bodyUserParams["interests"] = interests != null ? interests._id : null;

    const updateQuery = {
        userParams: bodyUserParams,
        description: description,
        status: newStatus,
        "facebook.gender": utils.isNull(gender) || utils.isStringEmpty(gender) ? null : (gender === 'male' || gender === 'female' ? gender : null),
        updatedAt: Date.now()
    };

    if (utils.isNotNull(birthday)) {
        updateQuery["facebook.birthday"] = birthday;
    }

    let expirationDate = req.body.expirationDate;
    if (utils.isNull(expirationDate) || expirationDate <= 0) {
        // We don't have an expirationDate, why good question, so we build a new one
        expirationDate = moment().add(constants.TOKEN_VALIDITY * 24 * 60 * 60, 's').toISOString();
    }

    // Do not lean this one, with use save on object user later
    User.findByIdAndUpdate(req.params.id, updateQuery, {new: true}).exec(function (err, user) {
        if (err) {
            res.status(500).json({
                error: "There was a problem setting the params in the database: " + err
            });
        } else if (utils.isNull(user)) {
            res.status(500).json({
                error: "There was a problem retrieving the user in the database: " + err
            });
        } else if (utils.isNotNull(interests)) {
            // Do not lean to inject interests back in user after save
            UserInterests.findOneAndUpdate({user: req.params.id}, interests, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }).exec(function (errUserInterests, userInterests) {
                if (errUserInterests) {
                    res.status(500).json({
                        error: "There was a problem setting the user interests in the database " + errUserInterests
                    });
                } else {
                    user.userParams.interests = userInterests._id;
                    user.save(function (errUserUpdate, updatedUser) {
                        if (errUserUpdate) {
                            res.status(500).json({
                                error: "There was a problem setting the user reference to interests in the database: " + errUserUpdate
                            });
                        } else {
                            updatedUser.userParams.interests = userInterests;

                            res.format({
                                json: function(){
                                    // Use UserAccess to filter user
                                    const userAccess = new UserAccess(updatedUser.toObject(), apiAccessToken, expirationDate, null);
                                    res.json(userAccess.user);
                                }
                            });
                        }
                    });
                }
            });
       } else {
            res.format({
                json: function(){
                    // Use UserAccess to filter user
                    const userAccess = new UserAccess(user.toObject(), apiAccessToken, expirationDate, null);
                    res.json(userAccess.user);
                }
            });
        }
    });
};

module.exports.anonymizeProfile = function (req, res, next) {

    const userId = req.body.userId;

    if (utils.isStringEmpty(userId) || utils.isStringEmpty(req.params.id) || userId !== req.params.id) {
        res.status(500).json({
            error: "What are you trying to do?"
        });
    } else {

        const updateQuery = {
            facebook: {
                id: null,
                email: null,
                name: null,
                firstName: null,
                lastName: null,
                middleName: null,
                birthday: null,
                pictureUrl: null,
                gender: null,
                locale: null,
                location: null,
                likes: null
            },
            description: {
                bio: null,
                school: null,
                employer: null,
                phone: {
                    number: null,
                    display: false
                },
                email: {
                    email: null,
                    display: null
                },
                languages: null,
                spotify: null,
                lifestyle: null,
                hobbies: null
            },
            google: {
                id: null
            },
            updatedAt: Date.now()
        };

        User.findByIdAndUpdate(req.params.id, updateQuery, {new: true, upsert: false}, function (err, updatedUser) {
            if (err) {
                res.status(500).json({
                    error: "There was a problem while anonymizing: " + err
                });
            }
            else {
                res.json({
                    success: true
                });
            }
        });
    }
};