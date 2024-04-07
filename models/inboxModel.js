const mongoose = require('mongoose');
const schema = mongoose.Schema;

const inboxSchema = new schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    ref: { String },
    refType: { String },
    type: { type: String },
    title: { type: String },
    message: { type: String },
    url: { type: String },
    settings: { type: Object },
    opened: { type: Boolean, default: false },

    status: { type: Number, default: 1 },
    trashed: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },
});

module.exports = mongoose.model('inboxes', inboxSchema);