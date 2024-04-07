

//? useful
const useful = require('../utils/useful')
const security = require('../security');


//? models
const questions = require('../models/questionModel');
// const answers = require('../models/answerModel');
const votes = require('../models/voteModel');




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
    'forums/getQuestions': { function: getQuestions, security: null }, //Todo  ['token']

    //! get Users Questions
    'forums/getUsersQuestions': { function: getUsersQuestions, security: null }, //Todo

    //! get One Question
    'forums/getOneQuestion': { function: getOneQuestion, security: null },

    //! post Question
    'forums/postQuestion': { function: postQuestion, security: null },

    //! remove Question
    'forums/removeQuestion': { function: removeQuestion, security: null },

    //! search Questions
    'forums/searchQuestions': { function: searchQuestions, security: null },

    //! get Special Questions
    'forums/getSpecialQuestions': { function: getSpecialQuestions, security: null },

    //! post Answer
    'forums/postAnswer': { function: postAnswer, security: null },

    //! remove Answer
    'forums/removeAnswer': { function: removeAnswer, security: null },

    //! get Answers
    'forums/getAnswers': { function: getAnswers, security: null },

    //! post Vote
    'forums/postVote': { function: postVote, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher



//! get One Question
async function getOneQuestion(data, res, extra) {



    let filter = data

    filter.removed = false

    console.log(filter)

    questions.findOneAndUpdate(filter, { $inc: { views: 1 } }, { new: true }).populate('creator', 'name family fullname image username').populate('category', 'values.title values.image').lean().then((doc) => {
        if(doc){
        answers.find({ question: doc._id, status: '1', removed: false }).sort({ votes: -1 }).populate('creator', 'name family fullname image username').then((answers) => {

            security.sendResponse(res, { info: doc, answers }, 200, 'simpleJson')



        })
    }else{
        security.sendNotFound(res)

    }
    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })

}
//! get One Question



//! get Answers
async function getAnswers(data, res, extra) {

    useful.getWrapper(data, res, extra, (wrapperRes) => {

        // console.log(wrapperRes)

        wrapperRes.filter.removed = false;

        wrapperRes.populates = [{ path: 'question', select: 'title' }]


        // console.log("ewweqw" ,wrapperRes)

        useful.findQuery(data, res, extra, "answers", wrapperRes, (docs, count, err) => {
            // console.log("ssss" ,docs)
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}
//! get Answers



//! post Answer
async function postAnswer(data, res, extra) {

    let promises = []



    let object = {
        question: data.question,
        body: data.body,
        status : data.status,
        lng: data.lng,
    }

    if (extra && extra.session && extra.session.roles && (extra.session.roles.includes('admin') || extra.session.roles.includes('superadmin'))) {

        object.status = data.status

    }

    // if (!data._id) {
    //     object.status = '0'
    // }

    Promise.all(promises).then(() => {

        let populates = [{ path: 'question', select: 'title' }]

        useful.postQuery(data, res, extra, "answers", object, populates, (queryResult, err) => {

            // console.log("qq" ,queryResult)

            if (!err) {
                security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')

                if (!data._id) {
                    questions.updateOne({ _id: object.question }, { $inc: { answers: 1 } }).then(() => { }).catch((nerr) => console.log(nerr))
                }

            } else {
                console.log(err)
                security.sendSomethingWrong(res)
            }
        })
    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })

}
//! post Answer



//! remove Answer
async function removeAnswer(data, res, extra) {

    useful.removeQuery(data, res, extra, "answers", () => { })

}
//! remove Answer




//! get Special Questions
async function getSpecialQuestions(data, res, extra) {

    let filter = { special: { $exists: true, $not: { $size: 0 } } }
    filter.removed = false

    if (data.lng != null) {
        filter['lng'] = data.lng
    }

    console.log(filter)
    

    questions.find(filter).populate({ path: 'creator', select: 'name image' }).lean().select({  }).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

    


}
//! get Special Questions



//! search Questions
async function searchQuestions(data, res, extra) {

    let myRegex = new RegExp([data.search].join(""), "i")

    let filter = { 'title': { $regex: myRegex } }
    filter.removed = false

    console.log(filter)

    if (data.lng != null) {
        filter['lng'] = data.lng
    }

    questions.find(filter).lean().limit(20).select({ body: 0 }).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}
//! search Questions



//! post Question 
async function postQuestion(data, res, extra) {


    // console.log("status" ,data.status)

    console.log("postQuestion")

    let object = {
        title: data.title,
        category: data.category,
        body: data.body,
        status: data.status,
        grade : data.grade,
        major : data.major,
        type: "question"
    }

    if (!data._id) {
        object.status = '0'
    }

    if (extra.session.admin) {

        object.status = data.status
        object.special = data.special

    }


    // object.special = data.special //todo you should delete this line when session is fixed

    // console.log(extra.session.roles)
    // console.log(object)


    let promises = []


    Promise.all(promises).then(() => {
        let populates = [{ path: 'category', select: 'values.title values.image' }]

        // console.log(populates)

        useful.postQuery(data, res, extra, "questions", object, populates, (queryResult, err) => {

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



//! get Users Questions 
async function getUsersQuestions(data, res, extra) {


    useful.getWrapper(data, res, extra, (wrapperRes) => {

        if (extra?.session?.user) {
            wrapperRes.filter['$or'] = [{ status: '1' }, { creator: extra?.session?.user }]
        } else {
            wrapperRes.filter.status = '1'
        }


        wrapperRes.filter.removed = false


        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        console.log("req", wrapperRes)



        wrapperRes.populates = [{ path: 'categories', select: 'values.title values.image' }, { path: 'creator', select: 'name family fullname image username' }]

        useful.findQuery(data, res, extra, "questions", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}
//! get Users Questions 





//! get Questions
async function getQuestions(data, res, extra) {

    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false

        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        wrapperRes.populates = [{ path: 'categories', select: 'values.title values.image' }, { path: 'creator', select: 'name family fullname image username' }]

        useful.findQuery(data, res, extra, "questions", wrapperRes, (docs, count, err) => {
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


//! post votes
async function postVote(data, res, extra) {

    let promises = []

    let object = {
        type: data.type,
        ref: data.ref,
        creator: extra.session.user
    }

    console.log(object)

    Promise.all(promises).then(() => {

        votes.findOne(object).then((doc) => {
            console.log(doc)

            if (doc) {

                // security.sendResponse(res, { message: '{{lang}}errors.duplicateVote' }, 500, 'simpleJson')

                votes.remove({ _id: doc._id }).then(() => {
                    security.sendResponse(res, { done: true, removed: true }, 200, 'simpleJson')


                    if (data.type == 'answer') {
                        answers.updateOne({ _id: data.ref }, { $inc: { votes: -1 } }).then(() => { })
                    }

                    if (data.type == 'question') {
                        questions.updateOne({ _id: data.ref }, { $inc: { votes: -1 } }).then(() => { })
                    }

                })


            } else {
                votes.create(object).then(() => {
                    security.sendResponse(res, { done: true }, 200, 'simpleJson')


                    if (data.type == 'answer') {
                        answers.updateOne({ _id: data.ref }, { $inc: { votes: 1 } }).then(() => { })
                    }

                    if (data.type == 'question') {
                        questions.updateOne({ _id: data.ref }, { $inc: { votes: 1 } }).then(() => { })
                    }

                })
            }

        }).catch((err) => {
            console.log(err);
            security.sendSomethingWrong(res)
        })

    }).catch(() => {
        security.sendSomethingWrong(res)
    })

}
//! post votes


//! remove Question
async function removeQuestion(data, res, extra) {
    useful.removeQuery(data, res, extra, "questions", () => { })
}
//! remove Question




module.exports = myApiSwitcher