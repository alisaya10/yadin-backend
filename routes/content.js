//? model
const contents = require("../models/contentModel");

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


let apisList = {

    //! get Contents
    'content/getContents': { function: getContents, security: null },

    //! get One Content
    'content/getOneContent': { function: getOneContent, security: null },

    //! post Content
    'content/postContent': { function: postContent, security: null },

    //! remove Content
    'content/removeContent': { function: removeContent, security: null },

    //! get Random Contents
    'content/getRandomContents': { function: getRandomContents, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher


//! get One Content

async function getOneContent(data, res, extra) {

    let filter = data

    contents.findOne(filter).lean().then((doc) => {

        security.sendResponse(res, { code: "#132", info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}

//! get One Content



//! post Content

async function postContent(data, res, extra) {


    //Todo check values first

    let object = {
        page: data.page,
        type: "content",
        values: data.values,
        cDate: new Date(),
        uDate: new Date(),
        creator: extra?.session?.user,
        removed: false
    }


    useful.postQuery(data, res, extra, "contents", object, null, () => {
        security.sendResponse(res, {success : true}, 200, 'simpleJson')
    })

}
//! post Content




//! get Random Contents
async function getRandomContents(data, res, extra) {


    let filter = data.filter ? data.filter : {}

    filter.removed = false

    if (data.lng != null) {
        filter['values.lng'] = data.lng
    }

    let count = data.count ? data.count : 4


    console.log("filter :", filter)

    contents.aggregate([
        { $match: filter }, { $sample: { size: count } },
    ]).then((docs) => {

        security.sendResponse(res, { code: "#132", info: docs }, 200, 'simpleJson')

    }).catch(() => {
        security.sendSomethingWrong(res)
    })


}
//! get Random Contents


//! get Contents

async function getContents(data, res, extra) {

useful.getWrapper(data, res, extra, (getWrapper) => {

    getWrapper.filter.removed = false


    useful.findQuery(data, res, extra, "contents", getWrapper, (docs, count, err) => {
        if (err) {
            console.log(err)
            security.sendSomethingWrong(res)
        } else {
            security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
        }
    })


  })
}

//! get Contents


//! remove Content
async function removeContent(data, res, extra) {

    useful.removeQuery(data, res, extra, "contents", () => { })

}
//! remove Content



module.exports = myApiSwitcher