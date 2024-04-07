const mongoose = require('mongoose');
const { numbers } = require('nanoid-dictionary');

const Schema = mongoose.Schema;

const courseFilesSchema = new Schema({
    image: { type: Object },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    files: { type: Object },


    removed: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },

})

module.exports = mongoose.model('courseFiles', courseFilesSchema);
