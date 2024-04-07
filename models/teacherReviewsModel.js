const mongoose = require('mongoose');
const { numbers } = require('nanoid-dictionary');

const teacherReviewsSchema = new mongoose.Schema({
    title: { type: String },
    slug: { type: String },
    description: { type: String },
    rating: { type: Number, default: 0 },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    verified: { type: String, default: '0' },

    writer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('teacherReviews', teacherReviewsSchema)