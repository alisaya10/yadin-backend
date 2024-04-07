const mongoose = require('mongoose');

const employeeModel = mongoose.Schema({
    username: { type: String, default: '' },
    password: { type: String, default: '' },
    permissions: { type: String, default: 'employee' },
    removed: { type: Boolean, default: false },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    active: { type: String, default: '1' },
    email: { type: String, default: '' },
    cDate: { type: Date },
    uDate: { type: Date },
});


module.exports = mongoose.model('employees', employeeModel)