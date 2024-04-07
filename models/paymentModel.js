const mongoose = require('mongoose')
const schema = mongoose.Schema

const paymentSchema = new schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    // course: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'courses'
    // },

    amount: { type: Number, default: 0 },
    teachercommission: { type: Array },
    date: { type: Date, default: Date.now() },
    description: { type: String, default: '' },
    //address: { type: Object },
    refId: { type: Number, default: '' },
    authority: { type: Array },
    status: { type: String },
    list: { type: Array, default: [] },
    recipient: { type: Object },
    method: { type: String, default: '' },
    discount: { type: String, default: '' },
    cDate: { type: Date },
    uDate: { type: Date },
    // seller: { type: String, default: '' },
    isChecked: { type: Boolean, default: false },
    payedToOwner: { type: Boolean, default: false },

    removed: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
})

module.exports = mongoose.model('payments', paymentSchema)