const mongoose = require('mongoose')
const Schema = mongoose.Schema

const connectionModel = new Schema({

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    thing: { type: mongoose.Schema.Types.ObjectId, ref: 'things' },
    applet: { type: mongoose.Schema.Types.ObjectId, ref: 'applets' },

    uTarget: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // user Target
    tTarget: { type: mongoose.Schema.Types.ObjectId, ref: 'things' }, // device Target
    aTarget: { type: mongoose.Schema.Types.ObjectId, ref: 'applets' }, // Applet Target
    dTarget: { type: mongoose.Schema.Types.ObjectId, ref: 'dashboards' }, // Dashboard Target

    settings: { type: Object },
    categorizerId: { type: String },
    type: { type: String },

    slug: { type: String },
    as: { type: Array },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'groups' }],

    isOwner: { type: Boolean },

    status: { type: String }, // A = Access ; P = Pending ; I = Invited ; B = blocked ; C = conditional
    muted: { type: Boolean },
    cDate: { type: Date },
    eDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },

});


module.exports = mongoose.model('connections', connectionModel);