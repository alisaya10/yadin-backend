const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const leitnerSchema = new Schema({

    title: { type: String, default: '' },
    body: { type: String, default: '' },
    answer: {type: String, default: ''},
    major : {type : String},
    grade : {type : String},
    course : {type : String},
    question: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'questions'
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('leitners', leitnerSchema);