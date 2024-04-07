const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contentSchema = new Schema({

    page: { type: String, default: '' },
    database: { type: String, default: '' },
    type: { type: String },
    values: { type: Object },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    cDate: { type: Date },
    uDate: { type: Date },
    status: { type: Number, default: 0 },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('contents', contentSchema);