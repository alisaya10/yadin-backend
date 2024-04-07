const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const lessonSchema = new Schema({

    video: { type: Object },
    teaser: { type: Object },
    files: { type: Object },

    image: {type: Object},
    title: { type: String, default: '' },
    slug: { type: String, default: '' },
    description: { type: String, default: '' },
    body: { type: String, default: '' },
    priority: { type: Number },
    currentLessonTime: { type: Number },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    }],
    lng: { type: Array },
    tags: { type: Array },
    special: { type: Array },
    locked: { type: Boolean, default: true },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
    teacher: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }]
})



module.exports = mongoose.model('lessons', lessonSchema);