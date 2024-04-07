const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
    type: { type: String },
    title: { type: String },
    Categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    }],
    parent : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'specifications'
    },
    description: { type: String },
    values: { type: Object },
    sufix: { type: String },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('specifications', specificationSchema)