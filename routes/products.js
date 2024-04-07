//? model
const productModel = require("../models/productModel");


//? useful
const useful = require('../utils/useful')

//? security
const security = require('../security');


//! codes

//! {{lang}}errors.somethingWentWrong //! code 128

//! {{lang}}errors.userDoesNotExists //! code 129

//!{{lang}}errors.userOrPasswordWrong //! code 130

//! {{lang}}errors.passwordPattern //! code 131

//! status 200 //! code 132

//! status 500 //! code 134

//! {{lang}}errors.wrongCredentials //! code 133 

//! {{lang}}errors.userExists //! code 135

//! {{lang}}errors.userIsInactive //! code 136

//! {{lang}}errors.invalidInputs //! code 137


let apisList = {

    //! get Questions
    'products/getProducts': { function: getProducts, security: null },

    //! add Product
    'products/addProduct': { function: addProduct, security: null },

    //! submit products
    'products/submitProduct': { function: submitProduct, security: null },

    //! remove Product
    'products/removeProduct': { function: removeProduct, security: null },

    //! get One Question
    'products/getOneProduct': { function: getOneProduct, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher




//! add Product
async function addProduct(data, res, extra) {


    console.log("datas", data)

    let isNew = true
    if (data._id) {
        isNew = false
    }


    let object = {
        title: data.title,
        categories: data.categories,
        specifications: data.specifications,
        status: data.status,
        colors: data.colors,
        values: data.values,
        price: data.price,
        priceSettings: data.priceSettings,
        images: data.images,
        cover: data.cover,
        owner: data.owner,
        description: data.description,
        cDate: new Date(),
        uDate: new Date(),
        creator: extra.session.user,
        removed: false
    }

    if (!data.status) {
        object.status = "1";
    }


    if (isNew) {
        productModel.create(object).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch((err) => {
            console.log(err)
            security.sendSomethingWrong(res)
        })

    } else {


        productModel.findOneAndUpdate({ _id: data._id }, {
            title: data.title,
            categories: data.categories,
            specifications: data.specifications,
            description: data.description,
            status: data.status,
            colors: data.colors,
            values: data.values,
            price: data.price,
            priceSettings: data.priceSettings,
            images: data.images,
            cover: data.cover,
            owner: data.owner,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }


}
//! add Product


//! add Product
async function submitProduct(data, res, extra) {


    console.log("datas", data)

    let isNew = true
    if (data._id) {
        isNew = false
    }


    let object = {
        title: data.title,
        categories: data.categories,
        specifications: data.specifications,
        status: data.status,
        colors: data.colors,
        values: data.values,
        price: data.price,
        priceSettings: data.priceSettings,
        images: data.images,
        description: data.description,
        cover: data.cover,
        cDate: new Date(),
        uDate: new Date(),
        creator: extra.session.user,
        removed: false
    }

    if (!data.status) {
        object.status = "1";
    }


    if (isNew) {
        productModel.create(object).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {


        productModel.findOneAndUpdate({ _id: data._id }, {
            title: data.title,
            categories: data.categories,
            specifications: data.specifications,
            status: data.status,
            colors: data.colors,
            values: data.values,
            price: data.price,
            description: data.description,
            priceSettings: data.priceSettings,
            images: data.images,
            cover: data.cover,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }


}
//! add Product


//! get products
async function getProducts(data, res, extra) {

    // console.log(data)

    // console.log('ssss')


    useful.getWrapper(data, res, extra, (getWrapper) => {

        getWrapper.filter.removed = false

        getWrapper.populates = [{ path: 'products', select: 'title images' }, { path: 'creator', select: 'name family fullname image username' }]

        useful.findQuery(data, res, extra, "products", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })
}
//! get products


//! get one category

async function getOneProduct(data, res, extra) {
    let filter = data
    filter.removed = false
    // console.log(filter)
    categoryModel.findOne(filter).lean().then((doc) => {
        security.sendResponse(res, { info: doc }, 200, 'simpleJson')
    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })
}

//! get one category




//! remove specifications
async function removeProduct(data, res, extra) {

    useful.removeQuery(data, res, extra, "products", () => {
        // security.sendResponse(res, { done: true }, 200, 'simpleJson')
    })

}
//! remove specifications



module.exports = myApiSwitcher