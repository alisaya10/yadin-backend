const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const answerSchema = new Schema({


    body: { type: String, default: '' },
    votes: { type: Number, default: 0 },
    status: { type: String, default: '' },

    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'questions'
    },


    lng: { type: Array },

    type: { type: String },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('answers', answerSchema);