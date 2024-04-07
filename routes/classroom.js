//? model
const classrooms = require("../models/classroomModel");

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

    //! get classrooms
    'classrooms/getClassroom': { function: getClassrooms, security: null },

    //! get One classroom
    'classrooms/getOneClassroom': { function: getOneClassroom, security: null },

    //! post classroom
    'classrooms/postClassroom': { function: postClassroom, security: null },

    //! remove classroom
    'classrooms/removeClassroom': { function: removeClassroom, security: null },


}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher


//! get One classroom

async function getOneClassroom(data, res, extra) {

    let filter = data

    classrooms.findOne(filter).lean().then((doc) => {

        security.sendResponse(res, { code: "#132", info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}

//! get One classroom



//! post classroom







async function postClassroom(data, res, extra) {


    //Todo check values first

    let object = {
        title: data.title,
        description : data.description,
        family : data.family,
        chooseDate : data.chooseDate,
        values: data.values,
        name: data.name,
        cDate: new Date(),
        uDate: new Date(),
        creator: extra.session.user,
        removed: false
    }


    useful.postQuery(data, res, extra, "classrooms", object, null, () => {
        security.sendResponse(res, {success : true}, 200, 'simpleJson') 
    })

}
//! post classroom




//! get classrooms


async function getClassrooms(data, res, extra) {

    useful.getWrapper(data, res, extra, (getWrapper) => {
  
      getWrapper.filter.removed = false
  
  
      useful.findQuery(data, res, extra, "classrooms", getWrapper, (docs, count, err) => {
          if (err) {
              console.log(err)
              security.sendSomethingWrong(res)
          } else {
              security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
          }
      })
  
  
    })
  
  
  }     

//! get classrooms


//! remove classroom
async function removeClassroom(data, res, extra) {

    useful.removeQuery(data, res, extra, "classrooms", () => { })

}
//! remove classroom



module.exports = myApiSwitcher