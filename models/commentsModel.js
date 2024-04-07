const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    body: { type: String },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    },
    writer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
    },

    status: { type: String, default: '0' },

    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('comments', CommentSchema)