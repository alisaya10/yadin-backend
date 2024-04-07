const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userQuizSchema = new Schema({

    title: { type: String, default: '' },
    body: { type: String, default: '' },
    answers: {type: Object},
    // values : {type : Object},
    image:{type: Object},
    practice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'practices'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    score : {type:Number},
    // question: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'questions'
    // },
    startTime: { type : Date},
    finishTime: { type : Date},
    
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('userPractice', userQuizSchema);