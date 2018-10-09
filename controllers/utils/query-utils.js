var moment = require('moment');

var utils = require('./utils');

var constants = require('../../config/constants');

module.exports = {

    addUsersFilterToQuery: function addUsersFilterToQuery(query, params) {
        var subOrQueries = new Array();

        var typeSubQueries = new Array();
        typeSubQueries.push({"userParams.item.type": params.type});
        typeSubQueries.push({"userParams.item.type": null});
        subOrQueries.push({"$or": typeSubQueries});

        var furnishedSubQueries = new Array();
        furnishedSubQueries.push({"userParams.item.furnished": (params.furnished === 'true')});
        furnishedSubQueries.push({"userParams.item.furnished": null});
        subOrQueries.push({"$or": furnishedSubQueries});

        if (!utils.isStringEmpty(params.rooms)) {

            var emptyRoomSubQueries = new Array();
            emptyRoomSubQueries.push({"userParams.item.room.room1": null});
            emptyRoomSubQueries.push({"userParams.item.room.room2": null});
            emptyRoomSubQueries.push({"userParams.item.room.room3": null});
            emptyRoomSubQueries.push({"userParams.item.room.room4": null});
            emptyRoomSubQueries.push({"userParams.item.room.room5": null});

            var roomSubQueries = new Array();
            roomSubQueries.push({"$and": emptyRoomSubQueries});

            if (parseFloat(params.rooms) < 2) {
                roomSubQueries.push({"userParams.item.room.room1": true});
            } else if (parseFloat(params.rooms) < 3) {
                roomSubQueries.push({"userParams.item.room.room2": true});
            } else if (parseFloat(params.rooms) < 4) {
                roomSubQueries.push({"userParams.item.room.room3": true});
            } else if (parseFloat(params.rooms) < 5) {
                roomSubQueries.push({"userParams.item.room.room4": true});
            } else if (parseFloat(params.rooms) >= 5) {
                roomSubQueries.push({"userParams.item.room.room5": true});
            }

            subOrQueries.push({"$or": roomSubQueries});
        }

        if (!utils.isStringEmpty(params.price)) {
            var price = parseFloat(params.price);

            var priceValueSubMaxQueries = new Array();
            priceValueSubMaxQueries.push({"userParams.item.budget.max": null});
            priceValueSubMaxQueries.push({"userParams.item.budget.max": {$gte: price}});

            var priceValueSubMinQueries = new Array();
            priceValueSubMinQueries.push({"userParams.item.budget.min": {$lte: price}});
            priceValueSubMinQueries.push({"userParams.item.budget.min": null});

            var priceSubQueries = new Array();
            priceSubQueries.push({"$or": priceValueSubMaxQueries});
            priceSubQueries.push({"$or": priceValueSubMinQueries});
            subOrQueries.push({"$and": priceSubQueries});
        }

        if (!utils.isStringEmpty(params.disabledFriendly)) {
            var disabledFriendlySubQueries = new Array();
            disabledFriendlySubQueries.push({"userParams.item.disabledFriendly": (params.disabledFriendly === 'true')});
            disabledFriendlySubQueries.push({"userParams.item.disabledFriendly": null});
            subOrQueries.push({"$or": disabledFriendlySubQueries});
        }

        if (!utils.isStringEmpty(params.petsAllowed)) {
            var petsAllowedSubQueries = new Array();
            petsAllowedSubQueries.push({"userParams.item.petsAllowed": (params.petsAllowed === 'true')});
            petsAllowedSubQueries.push({"userParams.item.petsAllowed": null});
            subOrQueries.push({"$or": petsAllowedSubQueries});
        }

        var availabilityBeginSubQueries = new Array();

        availabilityBeginSubQueries.push({"userParams.item.availability.begin": null});

        if (!utils.isStringEmpty(params.availablebegin)) {
            var beginBeginAvailabilityDate = moment(new Date(params.availablebegin)).add(-1 * constants.APPROX_BEGIN_AVAILABILITY, 'w').toDate();
            availabilityBeginSubQueries.push({"userParams.item.availability.begin": {$gte: beginBeginAvailabilityDate}});
        } else {
            var beginBeginAvailabilityDate = moment(new Date()).add(-1 * constants.APPROX_BEGIN_AVAILABILITY, 'w').toDate();
            availabilityBeginSubQueries.push({"userParams.item.availability.begin": {$gte: beginBeginAvailabilityDate}});
        }

        subOrQueries.push({"$or": availabilityBeginSubQueries});

        if (!utils.isStringEmpty(params.availableend)) {
            var availabilityEndSubQueries = new Array();

            var beginEndAvailabilityDate = moment(new Date(params.availableend)).add(-1 * constants.APPROX_END_AVAILABILITY, 'w').toDate();
            var endEndAvailabilityDate = moment(new Date(params.availableend)).add(constants.APPROX_END_AVAILABILITY, 'w').toDate();

            availabilityEndSubQueries.push({"userParams.item.availability.end": null});
            availabilityEndSubQueries.push({"userParams.item.availability.end": {$gte: beginEndAvailabilityDate, $lte: endEndAvailabilityDate}});

            subOrQueries.push({"$or": availabilityEndSubQueries});
        } else {
            query["userParams.item.availability.end"] = null;
        }

        var ageSubQueries = new Array();
        var maxBirthdayDate = moment().add((-1 * parseInt(params.ageMin)), 'y').toDate();
        var minBirthdayDate = moment().add((-1 * parseInt(params.ageMax)), 'y').toDate();
        ageSubQueries.push({"facebook.birthday": {$gte: minBirthdayDate, $lte: maxBirthdayDate}});
        ageSubQueries.push({"facebook.birthday": null});
        subOrQueries.push({"$or": ageSubQueries});

        if (!utils.isStringEmpty(params.gender) && params.gender !== "irrelevant") {
            query["facebook.gender"] = params.gender;
        }

        query["$and"] = subOrQueries;

        return query;
    }

};