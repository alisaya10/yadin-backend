const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teacherSchema = new Schema({

    image: { type: Object },
   

    name: { type: String, default: '' },
    status: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    
    description: { type: String, default: '' },
  
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },


    
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('teacher', teacherSchema);