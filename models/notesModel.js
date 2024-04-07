const mongoose = require('mongoose')
const Schema = mongoose.Schema

const notesModel = new Schema({
    title: { type: String },
    description: { type: String },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
   
  
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lessons'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    noteTime: { type : Number },
    
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },

});


module.exports = mongoose.model('notes', notesModel);