let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let messengerSchema = new Schema({


    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },


    accessLimit: [{
        seq: { type: Number },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        removed: {
            type: Boolean,
            default: false
        }
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    // visitor: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'messengerUsers'
    // },

    // // information: { type: Object },


    // // lastSeen: { type: Object },

    // lastSeen: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'messages'
    // },
    // alastSeen: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'messages'
    // },


    description: { type: String },
    link: { type: String },
    type: { type: String },
    settings: { type: Object },
    status: { type: Number, default: 0 },
    name: { type: String },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'messengers'
    },

    lastUpdate: { type: Date },
    lmDate: { type: Date }, // Last Message Date
    cDate: { type: Date },
    uDate: { type: Date },
    trashed: { type: Boolean, default: false },

});

module.exports = mongoose.model('messengers', messengerSchema);