let mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    facebook         : {
        id           : String,
        email        : String,
        name         : String,
        firstName   : String,
        lastName    : String,
        middleName    : String,
        birthday: {type: Date, default: null},
        pictureUrl: String,
        gender: String,
        location: {
            id: String,
            name: String
        },
        likes: {
            data: [{
                id: String,
                name: String,
                created_time: Date
            }]
        }
    },
    google: {
        id: String
    },
    userParams : {
        address: {
            addressName: String,
            city: String,
            country: String,
            location: {
                type: {
                    type: String,
                    enum: "Point",
                    default: "Point"
                },
                coordinates: {
                    type: [Number],
                    default: [0,0]
                }
            },
            distance: Number
        },
        item: {
            type: {type: String, default: null},
            furnished: {type: Boolean, default: null},
            room: {
                room1: {type: Boolean, default: null},
                room2: {type: Boolean, default: null},
                room3: {type: Boolean, default: null},
                room4: {type: Boolean, default: null},
                room5: {type: Boolean, default: null}
            },
            budget: {
                max: {type: Number, default: null},
                min: {type: Number, default: null}
            },
            tags: [String],
            groundFloor: {type: Boolean, default: null},
            disabledFriendly: {type: Boolean, default: null},
            petsAllowed: {type: Boolean, default: null},
            parking: {type: Boolean, default: null},
            minSize: {type: Number, default: null},
            availability: {
                begin: {type: Date, default: null},
                end: {type: Date, default: null}
            }
        },
        interests: {type: mongoose.Schema.Types.ObjectId, ref: "UserInterests"},
        appSettings: {
            browsing: {type: Boolean, default: true},
            calendarExport: {type:Boolean, default: null},
            pushNotifications: {type: Boolean, default: true},
            allowSuperstars: {type: Boolean, default: true}
        },
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now}
    },
    description: {
        bio: {type: String, default: null},
        school: {type: String, default: null},
        employer: {type: String, default: null},
        phone: {
            number: {type: String, default: null},
            display: {type: Boolean, default: true}
        },
        email: {
            email: {type: String, default: null},
            display: {type: Boolean, default: true}
        },
        languages: [{type: String, enum: ['ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bh', 'bi', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'ny', 'zh', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr', 'ff', 'gl', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'ia', 'id', 'ie', 'ga', 'ig', 'ik', 'io', 'is', 'it', 'iu', 'ja', 'jv', 'kl', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw', 'ky', 'kv', 'kg', 'ko', 'ku', 'kj', 'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv', 'gv', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'nb', 'nd', 'ne', 'ng', 'nn', 'no', 'ii', 'nr', 'oc', 'oj', 'cu', 'om', 'or', 'os', 'pa', 'pi', 'fa', 'pl', 'ps', 'pt', 'qu', 'rm', 'rn', 'ro', 'ru', 'sa', 'sc', 'sd', 'se', 'sm', 'sg', 'sr', 'gd', 'sn', 'si', 'sk', 'sl', 'so', 'st', 'es', 'su', 'sw', 'ss', 'sv', 'ta', 'te', 'tg', 'th', 'ti', 'bo', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'wo', 'fy', 'xh', 'yi', 'yo', 'za']}],
        displayName: {type: Boolean, default: false},
        spotify: {
            spotify: {type: mongoose.Schema.Types.ObjectId, ref: "UserSpotify"},
            display: Boolean
        },
        lifestyle: {
            cleanliness: {type: String, enum: ['clean', 'average', 'messy']},
            guests: {type: String, enum: ['never', 'rarely', 'occasionally', 'often']},
            party: {type: String, enum: ['rarely', 'occasionally', 'weekends', 'daily']},
            food: {type: String, enum: ['anything', 'vegetarian', 'vegan', 'gluten', 'halal', 'kosher', 'paleolithic', 'fruitarian']}
        },
        hobbies: {
            sports: ['soccer', 'ice_hockey', 'running', 'yoga', 'dancing', 'skiing', 'snowboarding', 'surfing', 'horse_riding', 'tennis', 'golfing', 'climbing', 'swimming', 'rowing', 'basketball', 'crossfit', 'biking', 'handball', 'field_hockey', 'ping_pong', 'badminton', 'boxing', 'martial_arts', 'ice_skating', 'fishing', 'rugby'],
            arts: ['movies', 'tv_shows', 'video_games', 'performing_arts', 'reading', 'drawing', 'guitar', 'musical_keyboard', 'singing', 'drums', 'saxophone', 'trumpet', 'violin'],
            food: ['cooking', 'coffee', 'wine', 'beer'],
            places: [ 'mountain', 'beach', 'camping', 'shopping']
        }
    },
    status: {type: String, enum: ['initialized', 'active', 'close', 'deleted', 'blocked'], default: 'initialized'},
    lastLogin: {type: Date, default: null},
    blocked: {type: Boolean, default: false},
    admin: Boolean,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

const userInterestsSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    interests: [{
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
    }],
    createdAt: {type: Date, default: Date.now}
});

const userSpotifySchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    token: {
        accessToken: {type: String, required: true},
        expire: {type: Date, default: Date.now},
        refreshToken: String
    },
    artists: [{
        id: String,
        name: String,
        external_urls: {
            spotify: String
        },
        images: [{
            height: Number,
            width: Number,
            url: String
        }],
        uri: String,
        display: {type: Boolean, default: true}
    }],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
}, { collection: 'userspotify' });

userSchema.index({ 'userParams.address.location' : '2dsphere' });

userInterestsSchema.index({ 'interests.location' : '2dsphere' });

mongoose.model('User', userSchema);
mongoose.model('UserInterests', userInterestsSchema);
mongoose.model('UserSpotify', userSpotifySchema);