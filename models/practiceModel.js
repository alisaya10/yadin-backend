const mongoose = require('mongoose');
const { numbers } = require('nanoid-dictionary');

const Schema = mongoose.Schema;

const practicesSchema = new Schema({

course: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'courses'
},
status:{type: String},
lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'lessons'
},
title: { type: String, default: '' },
description: { type: String, default: '' },
    files: { type: Object },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    body: { type: String, default: '' },
    image: { type: Object },
    level: {type: String, default:''},
    slug: { type: String, default: '' },
    time: { type: Number },
    score: { type: Number },
    question: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'questions'
    }],
    
    removed: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },
})

module.exports = mongoose.model('practices', practicesSchema);
