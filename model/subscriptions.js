var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    validity: {
        from: {type: Date, default: Date.now},
        end: Date
    },
    duration: {
        duration: {type: Number, required: true},
        type: {type: String, enum: ['days', 'months'], default: 'months'}
    },
    price: {
        price: {
            monthly: {type: Number, required: true}
        },
        free: {
            enabled: {type: Boolean, default: false},
            hashtag: String,
            needAcknowledgement: {type: Boolean, default: false}
        }
    },
    browse: {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

var subscriptionSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref : "User", required: true},
    product: {type: mongoose.Schema.Types.ObjectId, ref : "Product", required: true},
    end: {type: Date, required: true},
    browse: {type: Boolean, default: true},
    status: {type: String, enum: ['initialized', 'acknowledged', 'active', 'rejected'], default: 'initialized'},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

mongoose.model('Product', productSchema);
mongoose.model('Subscription', subscriptionSchema);