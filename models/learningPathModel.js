const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const learningPathSchema = new Schema({


    course: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    }],
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
 
    organizationGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizationGroup'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
  
})



module.exports = mongoose.model('learningPath', learningPathSchema);