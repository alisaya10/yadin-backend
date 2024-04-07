const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ticketSchema = new Schema({
    id: { type: String, default: '' },
    attachments: { type: Object },
    title: { type: String, default: '' },
    status: { type: String, default: '' },
    topic: { type: String },
    email: { type: String },
    phone: { type: Number },
    body: { type: String, default: '' },
    // body: { type: String, default: '' },
    // difficulty: { type: String, default: '' },
    // votes: { type: Number, default: 0 },
    // answers: { type: Number, default: 0 },
    // views: { type: Number, default: 0 },

    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'content'
    }],
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
    lng: { type: Array },
    // tags: { type: Array },
    // special: { type: Array },


    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    lDate: { type: Date },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('tickets', ticketSchema);