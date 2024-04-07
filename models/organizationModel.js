const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const organizationModel = new Schema({
    name: { type: String },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },

});

module.exports = mongoose.model('organization', organizationModel);