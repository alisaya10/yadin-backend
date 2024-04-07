var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tempUserSchema = new Schema({

    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    role: { type: String, default: 'user' },
    activationCode: { type: Number },
    codeLastTry: { type: Date },
    callerId: { type: String, default: '' },
    removed: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },
    
});
module.exports = mongoose.model('temp-users', tempUserSchema);