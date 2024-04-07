const mongoose = require('mongoose')
const schema = mongoose.Schema

const orderSchema = new schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    target: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },


    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'devices'
    },

    applet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'applets'
    },

    type: { type: String },
    rate: { type: Number },

    // balance: { type: Number, default: 0 },
    // unit: { type: String },
    // Price for each balance/unit


    // lastPayment: { type: String }, // ID of last payment
    status: { type: Number, default: 1 },
    removed: { type: Boolean, default: false },
    cDate: { type: Date },
    uDate: { type: Date },


})

module.exports = mongoose.model('billings', orderSchema)