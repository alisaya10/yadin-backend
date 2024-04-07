const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ticketReplySchema = new Schema({

    attachments: { type: Object },
    body: { type: String, default: '' },
    // votes: { type: Number, default: 0 },
    // status: { type: String, default: '' },

    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tickets'
    },


    lng: { type: Array },
    isAdminReply: { type: Boolean, default: false },


    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('ticketReplys', ticketReplySchema);