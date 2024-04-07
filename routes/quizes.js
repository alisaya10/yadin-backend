const useful = require('../utils/useful')
const security = require('../security');

const quizModel = require('../models/quizModel');
const userQuizModel = require('../models/userQuizModel');
const { question } = require('../routes');
const questionModel = require('../models/questionModel');

// const contentModel = require('../models/contentModel');


let apisList = {




    'quizes/getQuizes': { function: getQuizes, security: null },
    'quizes/getOneQuiz': { function: getOneQuiz, security: null },
    'quizes/postQuiz': { function: postQuiz, security: null },
    // 'Quizes/getSpecialQuizes': { function: getSpecialCourses, security: null }, 
    'quizes/removeQuiz': { function: removeQuiz, security: null },


}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions


// async function getMainCategories(data, res, extra) {

//     contentModel.find({}).lean().then((categories) => {

//     })


// }


async function getOneQuiz(data, res, extra) {

    let filter = data
    // let filterForUserQuiz = {quiz: data._id, user: extra.session.user}
    console.log("filter: ", filter);

        quizModel.findOne(filter).populate('course').lean().then((doc) => {

            questionModel.find({ quiz: doc._id }).then((questions) => {

                userQuizModel.findOne({ quiz: doc._id, user: extra.session.user }).then((current) => {
                    if (current) {
                        console.log("current: ", current);
                        

                    }

                    security.sendResponse(res, { info: doc, current, questions }, 200, 'simpleJson')
                })
            })

        })




}




async function postQuiz(data, res, extra) {

    console.log("data: ", data)

    let object = {

        image: data.image,
        level: data.level,
        time: data.time,
        score: data.score,
        question: data.question,
        title: data.title,
        description: data.description,
        course: data.course,
        files: data.files,


    }



    let populates = [{ path: 'course', select: 'title image' }]


    useful.postQuery(data, res, extra, "quizes", object, populates, (queryResult, err) => {
        // console.log(err)
        if (!err) {
            security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
        }
    })

}



async function getQuizes(data, res, extra) {
    // console.log("getLessons")

    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        wrapperRes.populates = [{ path: 'course', select: 'title image' }]


        useful.findQuery(data, res, extra, "quizes", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}


async function removeQuiz(data, res, extra) {

    // console.log(data)
    quizModel.updateOne({ _id: data.id }, {
        removed: true
    }, { upsert: false }).then(() => {

        security.sendResponse(res, { done: true }, 200, 'simpleJson')
        courseModel.updateOne({ _id: data.course }, { $inc: { quizes: -1 } }).then(() => { })

    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}






module.exports = myApiSwitcher

