const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const partnersSchema = new Schema({

    image: { type: Object },
    file: { type: Object },

    attachments: [{ type: Object }],

    name: { type: String, default: '' },
    status: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    lng: { type: Array },

    description: { type: String, default: '' },
    reqdescription: { type: String, default: '' },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },


    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('partners', partnersSchema);