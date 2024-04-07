const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    title: { type: String },
    categories: { type: String },
    description: { type: String },
    specifications: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'specifications'
    },
    status: { type: String },
    colors: [
        {
            color: { type: String },
            name: { type: String },
            hex: {type: String}
        },
    ],
    price: { type: String },
    priceSettings: {
        discount: {
            type: { type: String, default: '' },
            value: { type: Number, default: 0 },
        },
        priceBeforeDiscount: { type: Number, default: '' },
        currency: { type: String, default: '' },
        
    },
    images: { type: Array },
    cover: { type: Object },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('products', productSchema)