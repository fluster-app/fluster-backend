var mongoose = require('mongoose');
var itemSchema = new mongoose.Schema({
    hashId: String,
    voucher: String,
    title: String,
    address: {
        addressName: String,
        street: String,
        zip: String,
        city: String,
        district: String, // Kreis
        municipality: String, // Gemeinde
        state: String, // Kanton
        country: {type: String, default: "CH"},
        remark: String,
        location: {
            type: {
                type: String,
                enum: "Point",
                default: "Point"
            },
            coordinates: {
                type: [Number]
            }
        }
    },
    attributes: {
        type: {type: String, enum: ['rent', 'takeover', 'share', 'buy'], default: 'share'},
        furnished: {type: Boolean, default: null},
        rooms: Number,
        size: Number,
        sharedRooms: Number,
        sharedRoomsSize: Number,
        price: {
            gross: {type: Number, default: null},
            net: {type: Number, default: null},
            charges: {type: Number, default: null}
        },
        disabledFriendly: {type: Boolean, default: null},
        petsAllowed: {type: Boolean, default: null},
        availability: {
            begin: {type: Date, default: Date.now},
            end: Date
        },
        kidsWelcomed: {type: Boolean, default: null}
    },
    userLimitations: {
        age: {
            min: {type: Number, default: 18},
            max: {type: Number, default: 99}
        },
        gender: {type: String, enum: ['male', 'female', 'irrelevant'], default: 'irrelevant'}
    },
    itemDetail: {type: mongoose.Schema.Types.ObjectId, ref: "ItemDetail"},
    itemStars: {type: mongoose.Schema.Types.ObjectId, ref: "ItemStars"},
    end: {type: Date, required: true},
    likes: [{user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, at: {type: Date, default: Date.now}}],
    dislikes: [{user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, at: {type: Date, default: Date.now}}],
    source: String,
    sourceId: String,
    mainPhoto: String,
    highlight: Boolean,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    status: {type: String, enum: ['new', 'published', 'closed', 'cancelled', 'blocked', 'initialized'], default: 'new'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    appointment: {type: mongoose.Schema.Types.ObjectId, ref: "Appointment"}
});

var itemDetailSchema = new mongoose.Schema({
    description: String,
    floor: Number,
    bathrooms: Number,
    flatmate: Number,
    tags: ['internet', 'cable', 'washing_machine', 'dryer', 'dishwasher', 'cleaning_agent', 'gym', 'caretaker', 'lift', 'balcony', 'garden', 'view', 'fireplace', 'playground', 'child_friendly', 'swimming_pool', 'terrace', 'patio', 'attic', 'cellar', 'storage_room', 'steamer', 'sauna', 'hot_tub', 'mansard', 'villa', 'castle', 'rustic', 'duplex', 'allotment_garden', 'hobby_room', 'loft', 'chalet'],
    parking: {
        type: {type: String, enum: ['none', 'garage', 'parking_space']},
        included: Boolean,
        price: Number
    },
    item: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
    otherPhotos: [String],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

var itemStarsSchema = new mongoose.Schema({
    item: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
    stars: [{user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, at: {type: Date, default: Date.now}}],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

itemSchema.index({'address.location': '2dsphere'});

mongoose.model('Item', itemSchema);
mongoose.model('ItemDetail', itemDetailSchema);
mongoose.model('ItemStars', itemStarsSchema);