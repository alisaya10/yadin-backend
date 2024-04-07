const mongoose = require('mongoose');

const TypesSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('types', TypesSchema)