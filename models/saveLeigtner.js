const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const answerSchema = new Schema({

    // questions : {type : String},
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'leitners'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('saveLeitners', answerSchema);