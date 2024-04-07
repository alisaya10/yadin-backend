const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const finantialSchema = new Schema({

    title: { type: String, default: '' },
    description: { type: String, default: '' },
    amount: { type: Number },
    id: { type: Number },// code peygiri
    cDate: { type: Date },
    uDate: { type: Date },
    payDate: { type: Date },
    removed: { type: Boolean, default: false },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
})



module.exports = mongoose.model('finantials', finantialSchema);