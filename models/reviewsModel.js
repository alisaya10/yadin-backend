const mongoose = require('mongoose');
const { numbers } = require('nanoid-dictionary');

const reviewSchema = new mongoose.Schema({
    title: { type: String },
    slug: { type: String },
    description: { type: String },
    ratings: [{ type: Number, default: 0 }],
    verified: { type: String, default: '0' },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
    },

    writer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('reviews', reviewSchema)