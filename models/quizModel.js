const mongoose = require('mongoose');
const { numbers } = require('nanoid-dictionary');
const Schema = mongoose.Schema;

const quizSchema = new Schema({

    image: { type: Object },
    level: {type: String, default:''},
    title: { type: String, default: '' },
    slug: { type: String, default: '' },
    description: { type: String, default: '' },
    time: { type: Number },
    score: { type: Number },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
    question: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'questions'
    }],
    removed: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },
})




module.exports = mongoose.model('quizes', quizSchema);