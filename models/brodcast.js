const mongoose = require('mongoose');

const brodcastSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    public: { type: Boolean, default: false },
    isSeen: { type: Boolean , default : false},
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    message: { type: String, default: "" },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})


module.exports = mongoose.model('brodcasts', brodcastSchema)