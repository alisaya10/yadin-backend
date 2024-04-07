const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const autoGensSchema = new Schema({
    type: { type: String, default: '' },
    section: { type: String },

    key: { type: String, default: '' },
    number: { type: Number, default: 0 },
    format: { type: String, default: '' },
    unique: { type: Boolean, default: true },
    resetNum: { type: String, default: '' },
    date: { type: Date },
    updateDate: { type: Date },
    trashed: { type: Boolean, default: false },

});



module.exports = mongoose.model('autogens', autoGensSchema);