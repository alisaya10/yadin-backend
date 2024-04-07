const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const WallpaperSchema = new Schema({

    page: { type: String, default: '' },
    database: { type: String, default: '' },
    // applet: { type: String, default: '' },

    values: { type: Object },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    cDate: { type: Date },
    uDate: { type: Date },
    status: { type: Number, default: 0 },
    removed: { type: Boolean, default: false },
    verified: { type: Number },
});



module.exports = mongoose.model('wallpaper', WallpaperSchema);