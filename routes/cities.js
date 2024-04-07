const cityModel = require('../models/cityModel');
const countriesModel = require('../models/countriesModel');


//? useful
const useful = require('../utils/useful')

//?  security
const security = require('../security');

let apisList = {

    //! add city
    'config/addCities': { function: addCities, security: null },

    //! get all cities
    'config/getAllCities': { function: getAllCities, security: null },

    //! remove city
    'config/RemoveCities': { function: RemoveCities, security: null },

    //! add country
    'config/addCountries': { function: addCountries, security: null },

    //! get all countries
    'config/getAllCountries': { function: getAllCountries, security: null },

    //! remove country
    'config/removeCountries': { function: RemoveCountries, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher

//! add city
async function addCities(data, res, extra) {

    // console.log("postBlog")
    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        cityModel.create({
            name: data.name,
            description: data.description,
            country: data.country,
            cDate: new Date(),
            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {


        cityModel.findOneAndUpdate({ _id: data._id }, {
            name: data.name,
            description: data.description,
            country: data.country,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }


}
//! add city


//! get all cities
async function getAllCities(data, res, extra) {


    console.log('get')



    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false

        wrapperRes.populates = [{ path: 'categories', select: 'values.title' }, { path: 'creator', select: 'name family fullname image username' }]

        useful.findQuery(data, res, extra, "cities", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}
//! get all cities



//! remove city
async function RemoveCities(data, res, extra) {

    useful.removeQuery(data, res, extra, "cities", () => {
        // security.sendResponse(res, { done: true }, 200, 'simpleJson')
    })

}
//! remove city


//! add country
async function addCountries(data, res, extra) {

    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        countriesModel.create({
            name : data.name,
            description : data.description,
            cDate: new Date(),
            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {


        countriesModel.findOneAndUpdate({ _id: data._id }, {
            name : data.name,
            description : data.description,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }


}
//! add country


//! get all countries
async function getAllCountries(data, res, extra) {


    console.log('get')



    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false

        wrapperRes.populates = [{ path: 'categories', select: 'values.title' }, { path: 'creator', select: 'name family fullname image username' }]

        useful.findQuery(data, res, extra, "countries", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}
//! get all countries



//! remove country
async function RemoveCountries(data, res, extra) {

    useful.removeQuery(data, res, extra, "countries", () => {
        // security.sendResponse(res, { done: true }, 200, 'simpleJson')
    })

}
//! remove country


module.exports = myApiSwitcher
