const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const voteSchema = new Schema({

    ref: { type: String, default: '' },
    type: { type: String, default: '' },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('votes', voteSchema);