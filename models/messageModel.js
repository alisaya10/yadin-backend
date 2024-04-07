let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const GeoSchema = new Schema({
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], index: '2dsphere' }
})

let messageSchema = new Schema({

    sequence: { type: Number },

    messenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'messengers'
    },


    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    senderHub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    // isAdmin: { type: Boolean, default: false },

    status: { type: Number, default: 1 },

    text: { type: String },
    body: { type: String },
    form: { type: Object },

    file: { type: Object },
    voice: { type: Object },
    image: { type: Object },
    video: { type: Object },

    form: { type: Object },


    request: { type: Object },
    type: { type: String },


    files: { type: Object },
    sticker: { type: Object },

    location: GeoSchema,

    settings: { type: Object },
    systemInfo: {
        name: { type: String },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        type: { type: String }
    },
    action: {
        type: { type: String },
        message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'messages'
        },
        modified: { type: String }
    },
    modified: {
        lastMsg: { type: String },
        newMsg: { type: String },
    },
    edited: { type: Boolean },
    cDate: { type: Date },
    uDate: { type: Date },
    removedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
    }],
    trashed: { type: Boolean, default: false },

});

module.exports = mongoose.model('messages', messageSchema);