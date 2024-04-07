const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const organizationGroupModel = new Schema({
    name: { type: String },
    slug: { type: String },
    owner: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    users: {
        type: Array,

    },

    courses:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courses'
        }],

    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization'
    },
    contractDate: { type: Date },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },

});

module.exports = mongoose.model('organizationGroup', organizationGroupModel);