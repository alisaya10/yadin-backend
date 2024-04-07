//? model
const testsModel = require("../models/testModel");

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

    //! get tests
    'tests/getAll': { function: getTest, security: null },

    //! get One test
    'tests/getOneTest': { function: getOneTest, security: null },

    //! post test
    'tests/postTest': { function: postTest, security: null },

    //! remove test
    'tests/removeTest': { function: removeTest, security: null },


}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher


//! get One test

async function getOneTest(data, res, extra) {

    let filter = data

    testsModel.findOne(filter).lean().then((doc) => {

        security.sendResponse(res, { code: "#132", info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}

//! get One test



//! post test

async function postTest(data, res, extra) {

    console.log(data)


    //Todo check values first

    let object = {
        description: data.description,
        date: data.date,
        links: data.links,
        cDate: new Date(),
        uDate: new Date(),
        creator: extra.session.user,
        removed: false
    }


    useful.postQuery(data, res, extra, "testsModel", object, null, () => {
        security.sendResponse(res, {success : true}, 200, 'simpleJson')
    })

}
//! post test




//! get tests


async function getTest(data, res, extra) {


useful.getWrapper(data, res, extra, (getWrapper) => {

    getWrapper.filter.removed = false


    useful.findQuery(data, res, extra, "testsModel", getWrapper, (docs, count, err) => {
        if (err) {
            console.log(err)
            security.sendSomethingWrong(res)
        } else {
            security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
        }
    })


  })

}

//! get tests


//! remove test
async function removeTest(data, res, extra) {

    useful.removeQuery(data, res, extra, "testsModel", () => { })

}
//! remove test



module.exports = myApiSwitcher