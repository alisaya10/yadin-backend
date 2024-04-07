//? model
const organizationModel = require('../models/organizationModel');

//? useful
const useful = require('../utils/useful');

//? security
const security = require('../security');


let apisList = {

    'organization/getOrganizations': { function: getOrganizations, security: null },
    'organization/postOrganization': { function: postOrganization, security: null },
    'organization/removeOrganization': { function: removeOrganization, security: null },




}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions

function getOrganizations(data, res, extra) {

    useful.getWrapper(data, res, extra, (getWrapper) => {
        if (!getWrapper.filter) {
            getWrapper.filter = {}
        }
        getWrapper.filter.removed = false
        useful.findQuery(data, res, extra, 'organization', getWrapper, (docs, count, err) => {
            if (err) {
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}



function postOrganization(data, res, extra) {
    console.log('here')

    let object = {
        name: data.name,
        removed: false,
        cDate: new Date(),
        uDate: new Date()
    }
    let populates = []
    useful.postQuery(data, res, extra, "organization", object, populates, (queryResult, err) => {


        if (!err) {
            security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
        }
    })
}


function removeOrganization(data, res, extra) {
    console.log('object', data)
    organizationModel.findOneAndUpdate({ _id: data.id }, { removed: true }, { new: true }).then((organization) => {
        if (organization) {
            security.sendResponse(res, { info: organization }, 200, 'simpleJson')
        } else {
            security.sendNotFound(res)
        }

    }).catch(() => {
        security.sendSomethingWrong(res)
    })
}



module.exports = myApiSwitcher