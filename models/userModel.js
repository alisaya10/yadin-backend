const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String },
    family: { type: String },
    fullname: { type: String },
    password: { type: String },
    phone: { type: String },
    gender: { type: String },
    grade: { type: String },
    major: { type: String },
    wallet: { type: Number , defualt : 0 },

    bodyStyle: { type: String },
    type: { type: String , defualt : "user" },
    active: { type: Number, default: 1 }, // For blocking
    devices: [{ type: Object }], // {platform , id}
    birthday: { type: Date },
    activationCode: { type: Number },
    commission:{ type: Number },
    credit:{ type: Number, default: 0 },
    codeLastTry: { type: Date },
    lastActivity: { type: Date },
    status: { type: String, default: 'users' },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    inactive: { type: Boolean, default: false },
    email : {type : String},
    username : {type : String},
    weight : {type : Number},
    height: {type : Number},
    rating: {
        total: { count: { type: Number, default: 0 }, star: { type: Number, default: 0 } },
        oneStar: { title: { type: String, default: '1 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        twoStar: { title: { type: String, default: '2 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        threeStar: { title: { type: String, default: '3 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        fourStar: { title: { type: String, default: '4 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        fiveStar: { title: { type: String, default: '5 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
    },
    cover: { type: Object },
    image: { type: Object },
    removed: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },
});


module.exports = mongoose.model('users', userSchema);