const mongoose = require('mongoose');

const episodesSchema = new mongoose.Schema({
    title: { type: String},
    description: { type: String},
    image: { type: Object },
    audio: { type: Object },

    slides: { type: Array },
    locked: { type: Boolean, default: false },

    // isSeen: { type: Boolean , default : false},
    series: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'series'
    }],
    // message: { type: String, default: "" },
    // creator: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'users'
    // },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})


module.exports = mongoose.model('episodes', episodesSchema)