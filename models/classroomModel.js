const mongoose = require('mongoose');

const classroomSchema = mongoose.Schema({

    title: { type: String },
    values: { type: Object },
    chooseDate: {type : Date},
    description: { type: String },
    family: { type: String },
    name: { type: String },
    cDate: { type: String },
    uDate: { type: String },
    removed: { type: String }
    
})


module.exports = mongoose.model("classrooms", classroomSchema)