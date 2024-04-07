const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PodcastSchema = new Schema({

    page: { type: String, default: '' },
    database: { type: String, default: '' },
    // applet: { type: String, default: '' },

    title: { type: String, default: '' },
    description: { type: String, default: '' },
    thumbnail: { type: Object },
    podcast: { type: Object },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    series: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'series'
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },


    cDate: { type: Date },
    uDate: { type: Date },
    status: { type: Number, default: 0 },
    removed: { type: Boolean, default: false },
    verified: { type: Number },
});



module.exports = mongoose.model('podcasts', PodcastSchema);