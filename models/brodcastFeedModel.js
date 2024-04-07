const mongoose = require('mongoose');


const brodCastFeedSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'brodcasts'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('brodcastsFeed', brodCastFeedSchema)