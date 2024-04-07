const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GeoSchema = new Schema({
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], index: '2dsphere' }
})


const dataLogSchema = new Schema({

    thing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'things'
    },

    gateway: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'things'
    },
    // serverTimestamp: { type: Date },
    thingTimestamp: { type: Date },

    data: { type: Object },
    settings: { type: Object },
    location: GeoSchema,

    cDate: { type: Date },
    // uDate: { type: Date },

    trashed: { type: Boolean, default: false },
});


module.exports = mongoose.model('dataLogger', dataLogSchema);