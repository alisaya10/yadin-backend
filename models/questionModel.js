const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    

    title: { type: String, default: '' },
    body: { type: String, default: '' },
    answers: [{answer:{ type: String, default: '' }, score:{type: Number, default: 0}}],
    // values : {type : Object},
    image:{type: Object},
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quizes'
    },

    practice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'practices'
    },

    
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('questions', questionSchema);