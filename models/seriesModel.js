const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
    special: { type: Array },
    type: { type: String },
    thumbnail: { type: Object },
    body : {type : String},

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },

})

module.exports = mongoose.model('series', seriesSchema)