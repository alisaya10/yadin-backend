const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    type: { type: String },
    name: { type: String },
    description: { type: String },
    image: { type: Object },
    color: { type: String },

    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },
    series: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'series'
    },
    types: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'types'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('categories', categorySchema)