const mongoose = require('mongoose');
const { numbers } = require('nanoid-dictionary');

const GeoSchema = new mongoose.Schema({
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" },
});


const advertisementSchema = new mongoose.Schema({
    en: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        body: { type: String, default: '' },

    },
    fa: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        body: { type: String, default: '' },

    },
    slug: { type: String, default: "" },
    address: { type: String },
    cover: { type: Object },
    images: [{ type: Object }],
    video: { type: Object },
    priceInfo: [{
        title: { type: String },
        faTitle: { type: String },
        price: { type: Number },
        discount: { type: Number },
        expireDate: { type: Date },
    }],
    lowestPrice: { type: Number },
    discount: { type: Number },
    contactInfo: { type: Object },
    availability: { type: String, default: 'avtive' },
    views: { type: Number, default: 0 },
    rating: {
        total: { count: { type: Number, default: 0 }, star: { type: Number, default: 0 } },
        oneStar: { title: { type: String, default: '1 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        twoStar: { title: { type: String, default: '2 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        threeStar: { title: { type: String, default: '3 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        fourStar: { title: { type: String, default: '4 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
        fiveStar: { title: { type: String, default: '5 star' }, count: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
    },


    inWishlist: { type: Boolean, default: false },

    contactInfo: { type: Object },

    location: {
        address: { type: String },
        zipCode: { type: String },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'states'
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'cities'
        },
        openHours: [
            {
                day: { type: String },
                open: { type: Number },
                close: { type: Number }
            }
        ],
    },


    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
        },
    ],

    cDate: { type: Date },
    uDate: { type: Date },
    removed: { type: Boolean, default: false },
})

module.exports = mongoose.model('advertisements', advertisementSchema)