let mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
    validity: {
        from: {type: Date, default: Date.now},
        end: Date
    },
    limitations: {
        item: {
            type: {type: String, enum: ['rent', 'takeover', 'share', 'buy']}
        },
    },
    code: {type: String, required: true, unique : true},
    type: {type: String, enum: ['contest', 'gift'], default: 'contest'},
    termsUrl: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

const rewardSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref : "User", required: true},
    item: {type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true},
    prize: {type: mongoose.Schema.Types.ObjectId, ref : "Prize", required: true},
    at: {type: Date, default: Date.now},
    winner: {type: Boolean, default: null},
    shipped: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

mongoose.model('Prize', prizeSchema);
mongoose.model('Reward', rewardSchema);