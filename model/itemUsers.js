var mongoose = require('mongoose');

var itemUserSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    item: {type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true},
    interests: [{
        interest: {
            addressName: String,
            location: {
                type: {
                    type: String,
                    enum: "Point",
                    default: "Point"
                },
                coordinates: {
                    type: [Number]
                }
            },
            type: {type: String, enum: ['love', 'work', 'school', 'airport', 'train', 'training'], default: null},
            travelMode: {type: String, enum: ['bicycling', 'driving', 'transit', 'walking'], default: 'transit'},
            maxTravelTime: Number,
            status: {type: Boolean, default: true},
            createdAt: {type: Date, default: Date.now},
            updatedAt: {type: Date, default: Date.now}
        },
        time: {type: String, default: null, required: true}
    }],
    matching: {
        score: Number
    },
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

mongoose.model('ItemUser', itemUserSchema);