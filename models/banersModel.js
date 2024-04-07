const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BanerSchema = new Schema({

    image: { type: Object },
    mobileImage: { type: Object },
    title: { type: String },
    description: { type: String },
    link: { type: String },
    position: [{ type: String }],

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
        },
    ],
    pages: {type: String},

    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
});



module.exports = mongoose.model('baners', BanerSchema);