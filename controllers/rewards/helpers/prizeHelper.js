const mongoose = require('mongoose');

const Prize = mongoose.model('Prize');

const Q = require('q');

const utils = require('../../utils/utils');

function PrizeHelper() {
    this.findActivePrizes = findActivePrizes;
}

function findActivePrizes(gift, itemType) {
    let deferred = Q.defer();

    let query = {
        "validity.from": {$lte: Date.now()}
    };

    query["type"] = gift ? "gift" : "contest";

    let subOrQueries = new Array();

    if (!utils.isStringEmpty(itemType)) {
        let limitationsSubQueries = new Array();
        limitationsSubQueries.push({"limitations.item.type": itemType});
        limitationsSubQueries.push({"limitations.item.type": null});
        subOrQueries.push({"$or": limitationsSubQueries});
    }

    let fromSubQueries = new Array();
    fromSubQueries.push({"validity.end": {$gte: Date.now()}});
    fromSubQueries.push({"validity.end": null});
    subOrQueries.push({"$or": fromSubQueries});

    query["$and"] = subOrQueries;

    Prize.find(query).lean().exec(function (err, prizes) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(prizes);
        }
    });

    return deferred.promise;
}

module.exports = PrizeHelper;