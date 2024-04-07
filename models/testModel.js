const mongoose = require('mongoose');

const testSchema = mongoose.Schema({

    date: { type: Date },
    description: { type: String },

    links: [
        {
            label: { type: String },
            link: { type: String }
        }
    ],

    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },

})

module.exports = mongoose.model('testsModel', testSchema);