const mongoose = require('mongoose');
const { numbers } = require('nanoid-dictionary');

const Schema = mongoose.Schema;

const wishListSchema = new Schema({

user : {
    type : mongoose.Schema.Types.ObjectId,
    ref:'users'
},

course: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'courses'
},
lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'lessons'
},
removed: { type: Boolean, default: false },
cDate: { type: Date },
uDate: { type: Date },
})

module.exports = mongoose.model('wishList', wishListSchema);
