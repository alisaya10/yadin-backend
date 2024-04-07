//? useful
const useful = require('../utils/useful')
const security = require('../security');


//? models
const leitners = require('../models/leitnerModel');
const saveLeitners = require('../models/saveLeigtner')



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

    //! get Questions
    'leitners/getQuestions': { function: getQuestions, security: null }, //Todo  ['token']

    //! post Question
    'leitners/postQuestion': { function: postQuestion, security: null },

    //! remove Question
    'leitners/removeQuestion': { function: removeQuestion, security: null },

    //! save Question
    'leitners/saveQuestion': { function: saveQuestion, security: null },

    //! get saved Question
    'leitners/getSaveQuestion': { function: getSaveQuestion, security: null },

    //! remove seved Question
    'leitners/removeSaveQuestion': { function: removeSaveQuestion, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher




//! post Question 
async function postQuestion(data, res, extra) {

    console.log(data)

    let object = {
        title: data.title,
        grade : data.grade,
        major : data.major,
        course : data.course,
        body: data.body,
        answer : data.answer,
        lng: data.lng,
    }

    if (!data._id) {
        object.status = '0'
    }

    if (extra.session.roles && (extra.session.roles.includes('admin') || extra.session.roles.includes('superadmin'))) {

        object.status = data.status
        object.special = data.special

    }


    // object.special = data.special //todo you should delete this line when session is fixed

    // console.log(extra.session.roles)
    // console.log(object)


    let promises = []


    Promise.all(promises).then(() => {
        let populates = [{ path: 'question', select: 'body values.title values.major values.course values.category' }]

        // console.log(populates)

        useful.postQuery(data, res, extra, "leitners", object, populates, (queryResult, err) => {

            console.log("res", queryResult)

            if (!err) {
                security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
            } else {
                console.log(err)
                security.sendSomethingWrong(res)
            }
        })
    }).catch((err) => {
        console.log("err")
        console.log(err)
        security.sendSomethingWrong(res)
    })

}
//! post Question 




//! get Questions
async function getQuestions(data, res, extra) {

    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false

        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        wrapperRes.populates = [{ path: 'categories', select: 'values.title' }, { path: 'creator', select: 'name family fullname image username' }]

        useful.findQuery(data, res, extra, "leitners", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}
//! get Questions




//! remove Question
async function removeQuestion(data, res, extra) {
    useful.removeQuery(data, res, extra, "leitners", () => { })
}
//! remove Question






//! save Question
async function saveQuestion(data, res, extra) {


    console.log(data)


    saveLeitners.findOne({ question: data.question }).then((resp) => {
        // console.log("sadkfj;sldfkja;skldfjdas;lkdfj", resp[0].questions)


        if (resp) {
            security.sendResponse(res, { exist: true }, 200, 'simpleJson')
        }else {
            leitners.findOne({ title: data.question }).then((response) => {
                // console.log("res", response._id)


                let populates = [{ path: 'question', select: 'title ' }, { path: 'creator', select: 'name family fullname image username' }]

                object = {
                    // questionSave: response._id,
                    question: data.question
                }


                useful.postQuery(data, res, extra, "saveLeitners", object, populates, (queryResult, err) => {

                    // console.log("qq", queryResult)

                    if (!err) {
                        security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')

                    } else {
                        console.log(err)
                        security.sendSomethingWrong(res)
                    }
                })

            })
        }
    })

}
//! save Question



//! get saved Question
async function getSaveQuestion(data, res, extra) {

    useful.getWrapper(data, res, extra, (wrapperRes) => {

        // console.log(wrapperRes)

        wrapperRes.filter.removed = false;

        wrapperRes.filter.creator = extra.session.user;

        wrapperRes.populates = [{ path: 'question', select: 'title' }]


        // console.log("ewweqw", wrapperRes)

        useful.findQuery(data, res, extra, "saveLeitners", wrapperRes, (docs, count, err) => {
            // console.log("ssss", docs)


            // let ids;

            // for (i = 0; i < docs.length; i++) {
            //     console.log(docs[i]._id)
            //     ids = docs[i]._id;
            // }

            // saveLeitners.findOne({ _id: ids }).then((response) => {
            //     console.log("res", response)

            //     object = {
            //         questionSave: response._id
            //     }



            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }

        })

        // })
    })
}
//! get saved Question




//! remove saved Question
async function removeSaveQuestion(data, res, extra) {

    useful.removeQuery(data, res, extra, "saveLeitners", () => { })

}
//! remove saved Question







module.exports = myApiSwitcher