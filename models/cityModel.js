const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'countries'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('cities', citySchema)