const useful = require('../utils/useful')
const security = require('../security');

const questionModel = require('../models/questionModel');

// const contentModel = require('../models/contentModel');


let apisList = {




    'question/getQuestions': { function: getQuestions, security: null },
    'question/getOneQuestion': { function: getOneQuestion, security: null },
    'question/postQuestion': { function: postQuestion, security: null },
    // 'question/getSpecialQuestiones': { function: getSpecialCourses, security: null }, 
    'question/removeQuestion': { function: removeQuestion, security: null },


}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions


// async function getMainCategories(data, res, extra) {

//     contentModel.find({}).lean().then((categories) => {

//     })


// }


async function getOneQuestion(data, res, extra) {

    let filter = data

    questionModel.findOne(filter).populate('quiz').lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}







async function postQuestion(data, res, extra) {

    console.log("data in post question: ", data)

    let object = {

        image: data.image,
        score: data.score,
        quiz: data.quiz,
        practice: data.practice,
        title: data.title,
        description: data.description,
        answers: data.answers,
        cDate: new Date(),
        uDate: new Date()

    }


    let populates = [{ path: 'quiz', select: 'title image' }]

    useful.postQuery(data, res, extra, "questions", object, populates, (queryResult, err) => {
        // console.log(err)

        if (!err) {
            security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
        }
    })

}



async function getQuestions(data, res, extra) {
    // console.log("getLessons")

    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        wrapperRes.populates = [{ path: 'quiz', select: 'title image' }]


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


async function removeQuestion(data, res, extra) {

    // console.log("id",data.id)
    questionModel.updateOne({ _id: data.id,removed:false }, {
        removed: true
    }).then((result) => {
        // console.log('reeeeeeee', result);
        security.sendResponse(res, { done: true }, 200, 'simpleJson')

    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}






module.exports = myApiSwitcher

