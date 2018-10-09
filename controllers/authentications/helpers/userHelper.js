const mongoose = require('mongoose');

const User = mongoose.model('User');
const UserInterests = mongoose.model('UserInterests');

const Subscription = mongoose.model('Subscription');

const Q = require('q');
const _ = require('underscore');

const utils = require('../../utils/utils');

function UserHelper() {
    this.findByUserId = findAccountByUserId;
    this.updateAccount = updateAccount;
    this.updateLastLogin = updateLastLogin;
    this.disableAccount = disableAccount;
    this.findOrCreateAccount = findOrCreateAccount;
    this.hasAccountChanged = hasAccountChanged;
    this.findActiveSubscriptionByUserId = findCurrentSubscriptionByUserId;
}

function findAccountById(facebookId, googleId) {
    let deferred = Q.defer();

    let query = {};

    if (!utils.isStringEmpty(googleId)) {
        query["google.id"] = googleId;
    } else {
        query["facebook.id"] = facebookId;
    }

    const populateFields = [{path: "userParams.interests", select: "interests", options: {lean: true}}];

    User.findOne(query).lean().populate(populateFields).exec(function (err, user) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(user);
        }
    });

    return deferred.promise;
}

function findAccountByUserId(userId) {
    let deferred = Q.defer();

    let query = {
        '_id': userId
    };

    let validStatus = new Array();
    validStatus.push({"status": "active"});
    validStatus.push({"status": "initialized"});
    query["$or"] = validStatus;

    const populateFields = [{path: "userParams.interests", select: "interests", options: {lean: true}}];

    User.findOne(query).lean().populate(populateFields).exec(function (err, user) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(user);
        }
    });

    return deferred.promise;
}

function createAccount(userProfile) {
    let deferred = Q.defer();

    // if there is no user found with that facebook id, create them
    let newUser = new User();

    // If user didn't use google login then it's a facebook login
    if (!utils.isStringEmpty(userProfile.googleUserId)) {
        newUser.google.id = userProfile.googleUserId;
    } else {
        newUser.facebook.id = userProfile.facebookUserId;
    }

    // set all of the facebook information in our user model
    // we use facebook tag also for the google information
    newUser.facebook.firstName = userProfile.firstName;
    newUser.facebook.lastName = userProfile.lastName;
    newUser.facebook.middleName = userProfile.middleName;
    newUser.facebook.name = userProfile.name;
    newUser.facebook.email = userProfile.email; // facebook can return multiple emails so we'll take the first
    newUser.facebook.birthday = userProfile.birthday;
    newUser.facebook.pictureUrl = userProfile.pictureUrl;
    newUser.facebook.gender = userProfile.gender;
    newUser.facebook.location = userProfile.location;
    newUser.facebook.likes = userProfile.likes;

    newUser.description.email.email = userProfile.email;

    newUser.save(function (err, account) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(account);
        }
    });

    return deferred.promise;
}

function updateAccount(userProfile) {
    let deferred = Q.defer();

    findAccountById(userProfile.facebookUserId, userProfile.googleUserId)
        .then(function (user) {

            let updateQuery = {
                'facebook.name': userProfile.name,
                'facebook.firstName': userProfile.firstName,
                'facebook.lastName': userProfile.lastName,
                'facebook.middleName': userProfile.middleName,
                'facebook.email': userProfile.email,
                'facebook.birthday': userProfile.birthday,
                'facebook.pictureUrl': userProfile.pictureUrl,
                'facebook.gender': userProfile.gender,
                'facebook.location': userProfile.location,
                'facebook.likes': userProfile.likes
            };

            // If facebook and peterparker email address are the same aka if user never change his email address
            // Then update it too
            if (user.description.email.email === user.facebook.email) {
                updateQuery['description.email.email'] = userProfile.email;
            }

            const populateFields = [{path: "userParams.interests", select: "interests", options: {lean: true}}];

            User.findOneAndUpdate({_id: user._id}, updateQuery,
                {upsert: false, new: true}).lean().populate(populateFields).exec(function (err, user) {
                if (err) {
                    deferred.reject(new Error(err));
                }
                else {
                    deferred.resolve(user);
                }
            });

        });

    return deferred.promise;
}

function updateLastLogin(user) {
    let deferred = Q.defer();

    const query = {_id: user._id};

    let update = {
        lastLogin: Date.now(),
        updatedAt: Date.now()
    };

    // If user log again after having already an account and closed it, reactivate the status
    if (isAccountStatusClose(user)) {
        update["status"] = "active";
    }

    const options = {
        'new': true
    };

    const populateFields = [{path: "userParams.interests", select: "interests", options: {lean: true}}];

    User.findOneAndUpdate(query, update, options).lean().populate(populateFields).exec(function (err, user) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve(user);
            }
        }
    );
    return deferred.promise;
}

function disableAccount(userId, status) {
    let deferred = Q.defer();

    const query = {
        _id: userId
    };

    const options = {
        'new': true
    };

    const populateFields = [{path: "userParams.interests", select: "interests", options: {lean: true}}];

    // Only close and deleted are possible
    const statusToSet = utils.isStringEmpty(status) ? 'close' : ('deleted' === status ? 'deleted' : 'close');

    User.findOneAndUpdate(query,
        {
            status: statusToSet
        },
        options).lean().populate(populateFields).exec(function (err, user) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve(user);
            }
        }
    );
    return deferred.promise;
}

// Attempt to find an existing account by username, and if it cannot find it, it creates it
function findOrCreateAccount(userProfile, doCreate) {
    let deferred = Q.defer();

    findAccountById(userProfile.facebookUserId, userProfile.googleUserId)
        .then(function (user) {
            if (user && user._id && user._id !== '') {
                if (!user.blocked) {
                    deferred.resolve(user); // Found!
                } else {
                    deferred.reject(new Error("User is blocked."));
                }
            }
            else if (doCreate && (utils.isNull(user) || user === 'undefined')) {
                // Let's create the account
                createAccount(userProfile)
                    .then(function (user) {
                        deferred.resolve(user);
                    })
                    .fail(function (err) {
                        deferred.reject(err);
                    });
            } else {
                deferred.reject(new Error("User is not allowed."));
            }
        })
        .fail(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

function isAccountStatusClose(user) {
    return user.status === 'close';
}

function hasAccountChanged(currentUser, userProfile) {
    let deferred = Q.defer();

    if (currentUser.facebook.firstName !== userProfile.firstName ||
        currentUser.facebook.lastName !== userProfile.lastName ||
        currentUser.facebook.email !== userProfile.email ||
        new Date(currentUser.facebook.birthday).toString() !== new Date(userProfile.birthday).toString() ||
        currentUser.facebook.pictureUrl !== userProfile.pictureUrl ||
        currentUser.facebook.gender !== userProfile.gender ||
        hasLocationChanged(currentUser, userProfile) ||
        hasFacebookLikesChanged(currentUser, userProfile)) {
        deferred.resolve(true);
    } else {
        deferred.resolve(false);
    }

    return deferred.promise;
}

function hasLocationChanged(obj1, obj2) {
    if (!utils.isNotNull(obj1.facebook.location) && !utils.isNotNull(obj2.location)) {
        return false;
    } else {
        return !_.isEqual(obj1.facebook.location, obj2.location);
    }
}

function hasFacebookLikesChanged(obj1, obj2) {
    if (!utils.isNotNull(obj1.facebook.likes) && !utils.isNotNull(obj2.likes)) {
        return false;
    }

    if (obj1 !== null && obj2 !== null && utils.isNotNull(obj1.facebook.likes) && utils.isNotNull(obj2.likes) && utils.isNotNull(obj1.facebook.likes.data) && utils.isNotNull(obj2.likes.data) && obj1.facebook.likes.data.length && obj2.likes.data.length) {
        if (obj1.facebook.likes.data.length != obj2.likes.data.length) {
            return true;
        }

        for (var i = 0, len = obj1.facebook.likes.data.length; i < len; i++) {
            if (obj1.facebook.likes.data[i].id !== obj2.likes.data[i].id ||
                obj1.facebook.likes.data[i].name !== obj2.likes.data[i].name) {
                return true;
            }
        }

        return false;
    }

    return true;
}

function findCurrentSubscriptionByUserId(user) {
    let deferred = Q.defer();

    const query = {
        'user': user,
        'end': {$gte: Date.now()},
        'status': {$ne:"rejected"}
    };

    Subscription.findOne(query).lean().exec(function(err, subscription) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(subscription);
        }
    });

    return deferred.promise;
}

module.exports = UserHelper;