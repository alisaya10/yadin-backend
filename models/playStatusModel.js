const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playStatusModel = new Schema({
    
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
    status: { type: String, default: '' },
  
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lessons'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    lastPauseTime: { type : Number },
    
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },

});


module.exports = mongoose.model('playStatus', playStatusModel);