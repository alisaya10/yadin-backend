const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const courseSchema = new Schema({

    image: { type: Object },
    title: { type: String, default: '' },
    audiance: { type: String, default: '' },
    achievements: { type: String, default: '' },
    slug: { type: String, default: '' },
    description: { type: String, default: '' },
    // body: { type: String, default: '' },
    lessonsTotalLength: { type: Number, default: 0 },
    practiceTotal: { type: Number },
    level: { type: String },
    price: { type: Number },
    userCount: { type: Number, default: 0 },
    books: { type: Number, default: 0 },
    special: { type: Array },
    orgOnly: { type: Boolean, default: false },
    teaser: { type: Object },

    lessonsCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },

    lessons: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lessons'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
    notes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notes'
    },

    // teacher: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'content'
    // },


    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quiz'
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    }],
    lng: { type: Array },
    tags: { type: Array },
    special: { type: Array },


    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    rating: [{
        total: { count: { type: Number, default: 0 }, star: { type: Number, default: 0 } },
        oneStar: { title: { type: String, default: '1 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        twoStar: { title: { type: String, default: '2 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        threeStar: { title: { type: String, default: '3 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        fourStar: { title: { type: String, default: '4 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        fiveStar: { title: { type: String, default: '5 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
    }],
    score: { type: Number, default: 0 },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    group: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'messengers'
    }
})



module.exports = mongoose.model('courses', courseSchema);