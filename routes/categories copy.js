//? model
const categoryModel = require("../models/categoryModel");
const specificationsModel = require('../models/specificationModel');


//? useful
const useful = require('../utils/useful')

//? security
const security = require('../security');


//! codes

// {{lang}}errors.somethingWentWrong //! code 128

// {{lang}}errors.userDoesNotExists //! code 129

//{{lang}}errors.userOrPasswordWrong //! code 130

// {{lang}}errors.passwordPattern //! code 131

// status 200 //! code 132

// status 500 //! code 134

// {{lang}}errors.wrongCredentials //! code 133 

// {{lang}}errors.userExists //! code 135

// {{lang}}errors.userIsInactive //! code 136

// {{lang}}errors.invalidInputs //! code 137


//Todo dont forget to set model and functions


let apisList = {

    //! add category
    'categories/addCategory': { function: addCategory, security: null },

    //! get categories
    'categories/getAllCategory': { function: getAllCategory, security: null },

    //! get all main category
    'categories/getCategories': { function: getAllMain, security: null },

    //! get one category
    'categories/getOneCategory': { function: getOneCategory, security: null },

    //! remove category
    'categories/removeCategory': { function: removeCategory, security: null },

    //! add specifications
    'categories/addSpecifications': { function: addSpecifications, security: null },

    //! get all specifications
    'categories/getAllSpecifications': { function: getAllSpecifications, security: null },

    //! remove specifications
    'categories/RemoveSpecifications': { function: RemoveSpecifications, security: null },




}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher



//! create/update category
async function addCategory(data, res, extra) {

    console.log("data", data)

    let obj = {}




    let object = {
        type: data.type,
        image: data.image,
        parent: data.parent,
        en: data?.en,
        fa: data?.fa,
        cDate: new Date(),
        uDate: new Date()
    }



    useful.postQuery(data, res, extra, "categories", object, null, (doc) => {
        if (doc) {
            security.sendResponse(res, { success: true, info: doc }, 200, 'simpleJson')
        }
        else {
            security.sendSomethingWrong(res)
        }
    })

}



//! get all categories
async function getAllCategory(data, res, extra) {

    useful.getWrapper(data, res, extra, (getWrapper) => {

        getWrapper.filter.removed = false

        getWrapper.populates = [{ path: 'parent', select: 'en.name fa.name' }]



        useful.findQuery(data, res, extra, "categories", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}



//! get All Main Category
async function getAllMain(data, res, extra) {

    categoryModel.find({ parent: { $eq: null } }).then((doc) => {
        // console.log(doc)
        if (doc) {
            security.sendResponse(res, { info: doc }, 200, 'simpleJson')
        } else {
            security.sendSomethingWrong(res)
        }
    })

}



//! get one category

async function getOneCategory(data, res, extra) {
    let filter = data
    filter.removed = false
    console.log(filter)
    categoryModel.findOne(filter).lean().then((doc) => {
        security.sendResponse(res, { info: doc }, 200, 'simpleJson')
    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })
}



//! remove category
async function removeCategory(data, res, extra) {

    useful.removeQuery(data, res, extra, "categories", () => { })

}



//! add specifications
async function addSpecifications(data, res, extra) {

    // console.log("postBlog")
    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        specificationsModel.create({
            type: data.type,
            title: data.title,
            categories: data.categories,
            description: data.description,
            values: data.values,
            parent: data.parent,
            sufix: data.sufix,
            cDate: new Date(),
            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {


        specificationsModel.findOneAndUpdate({ _id: data._id }, {
            type: data.type,
            title: data.title,
            parent: data.parent,
            categories: data.categories,
            description: data.description,
            sufix: data.sufix,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }


}


//! get all specifications
async function getAllSpecifications(data, res, extra) {


    console.log('get')



    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false

        wrapperRes.populates = [{ path: 'categories', select: 'values.title' }, { path: 'specifications', select: 'title' }]

        useful.findQuery(data, res, extra, "specifications", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}



//! remove specifications
async function RemoveSpecifications(data, res, extra) {

    useful.removeQuery(data, res, extra, "specifications", () => {
        // security.sendResponse(res, { done: true }, 200, 'simpleJson')
    })

}



module.exports = myApiSwitcher