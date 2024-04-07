const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const GeoSchema = new Schema({
    type: { type: String, default: "Point" },
    coordinates: { type: [Number] }
})


const thingschema = new Schema({

    uId: { type: String },

    name: { type: String },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'values'
    },
    partNumber: { type: String },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'values'
    }],

    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'values'
    }],

    latestData: { type: Object },

    public: { type: Boolean },
    private: { type: Boolean },


    // thingsType: { type: String }, // ? AARAY ? 
    images: { type: Object },
    firmVersion: { type: String },
    macAddress: { type: String },

    type: { type: String }, // GATEWAY or Device
    structure: [{ type: Object }], // Title, key,  UUID, Properties,unit, unitType 
    actions: { type: Object },

    // technologies: [{ type: Object }],
    technology: [{ type: String }],
    protocols: [{ type: Object }],

    wiki: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'thingsWiki'
    },
    gateway: { type: String },
    // gateway: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'things'
    // }, ],
    price: { type: Number, default: 0 },

    // characteristics: [{ type: Object }], // Handler, UUID, Property, PermissionList,unit, unitType, Value, Tags, Type (Public, Private),Priorities 

    values: { type: Object },


    publishStatus: [{ type: Object }],

    battery: { type: String },
    antenna: { type: String },

    connected: { type: Boolean },
    cryptoKeys: [{ type: Object }],
    config: [{ type: Object }],
    settings: { type: Object }, // Extra settings

    description: { type: String },

    connedtedThings: [{ type: Object }],

    location: GeoSchema,
    indoorLocation: { type: Object },
    address: { type: String },

    country: { type: String },
    city: { type: String },
    timeZone: { type: String },

    verified: { type: Number, default: 0 },


    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    parents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'things'
    }, ],
    longitude: { type: String },
    latitude: { type: String },
    hasLocation: { type: Boolean, default: false },
    lastActivity: { type: Date },
    status: { type: Number, default: 1 },
    active: { type: Number, default: 1 }, // For blocking
    removed: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },
    duDate: { type: Date },



});

thingschema.index({ location: "2dsphere" })

module.exports = mongoose.model('things', thingschema);