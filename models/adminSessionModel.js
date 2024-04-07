const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const userSchema = new Schema({


    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees'
    },

    token: { type: String },
    key: { type: String },


    userAgent: { type: String },
    deviceType: { type: String },
    ip: { type: String },
    lastActivity: { type: Date },

    status: { type: Number, default: 1 },

    country: { type: String },
    city: { type: String },

    removed: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },



});


module.exports = mongoose.model('adminSessions', userSchema);