const typesModel = require('../models/typesModel');


//? useful
const useful = require('../utils/useful')

//?  security
const security = require('../security');

let apisList = {

    //! add types
    'types/add': { function: addtypes, security: null },

    //! get all types
    'types/getAll': { function: getAlltypes, security: null },

    //! remove types
    'types/Remove': { function: Removetypes, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher


//! add types
async function addtypes(data, res, extra) {

    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        typesModel.create({
            name: data.name,
            description: data.description,
            cDate: new Date(),
            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {


        typesModel.findOneAndUpdate({ _id: data._id }, {
            name: data.name,
            description: data.description,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }


}


//! get all types
async function getAlltypes(data, res, extra) {


    console.log('get')



    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false

        // wrapperRes.populates = [{ path: 'categories', select: 'values.title' }, { path: 'creator', select: 'name family fullname image username' }]

        useful.findQuery(data, res, extra, "types", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}



//! remove types
async function Removetypes(data, res, extra) {

    useful.removeQuery(data, res, extra, "types", () => {
        // security.sendResponse(res, { done: true }, 200, 'simpleJson')
    })

}


module.exports = myApiSwitcher
