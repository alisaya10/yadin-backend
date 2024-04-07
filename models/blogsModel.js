const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const blogsSchema = new Schema({

    image: { type: Object },
    title: { type: String, default: '' },
    slug: { type: String, default: '' },
    description: { type: String, default: '' },
    body: { type: String, default: '' },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    }],


    lng: { type: Array },
    tags: { type: Array },
    special: { type: Array },


    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})



module.exports = mongoose.model('blogs', blogsSchema);