const useful = require('../utils/useful')
const security = require('../security');

const userQuizModel = require('../models/userQuizModel');
const questionModel = require('../models/questionModel');
const userCourseModel = require('../models/userCourseModel');
const quizModel = require('../models/quizModel');

// const contentModel = require('../models/contentModel');


let apisList = {




    'userQuiz/startQuiz': { function: startQuiz, security: null },
    'userQuiz/endQuiz': { function: endQuiz, security: null },
    'userQuiz/getCurrentQuiz': { function: getCurrentQuiz, security: null },
    'userQuiz/submitAnswer': { function: submitAnswer, security: null },
    'userQuiz/getUserQuizes': { function: getUserQuizes, security: null },

}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions


// async function getMainCategories(data, res, extra) {

//     contentModel.find({}).lean().then((categories) => {

//     })


// }
async function getUserQuizes(data, res, extra) {
    console.log('ooooooooooooooooooooobjects');
    let filter = data.filter
   
    filter.user = extra.session.user
    filter.removed = false

    quizModel.find(filter).lean().then((quizes) => {
        let promises = []
        promises.push(new Promise((resolve, reject) => {
    
        quizes.forEach(quiz => {

              userQuizModel.findOne({ quiz: quiz._id }).lean().populate('quiz').then((doc) => {
                quiz.score = doc.score
        })
        });
               
    }))
        Promise.all(promises).then(() => {
        security.sendResponse(res, { info: quizes }, 200, 'simpleJson')
        })

    })

}
// async function getUserQuizes(data, res, extra) {
//     // console.log("getLessons")

//     useful.getWrapper(data, res, extra, (wrapperRes) => {

//         wrapperRes.filter.removed = false
//         if (data.lng) {
//             wrapperRes.filter['lng'] = data.lng
//         }
//         wrapperRes.filter.user = extra.session.user

//         wrapperRes.populates = [{ path: 'quiz'}]


//         useful.findQuery(data, res, extra, "userQuiz", wrapperRes, (docs, count, err) => {
//             if (err) {
//                 console.log(err)
//                 security.sendSomethingWrong(res)
//             } else {
//                 security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
//             }
//         })
//     })
// }




async function startQuiz(data, res, extra) {

    // console.log('startQuiz')

    userQuizModel.remove({ user: extra.session.user, quiz: data.quiz }).then(() => {

        userQuizModel.create({
            user: extra.session?.user,
            quiz: data.quiz,
            startTime: new Date(),
            cDate: new Date(),
            uDate: new Date(),
            removed: false


        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')

        }).catch((err) => {
            console.log(err)
            security.sendSomethingWrong(res)
        })

    }).catch((err) => {
        console.log(err)

        security.sendSomethingWrong(res)
    })



}
async function endQuiz(data, res, extra) {
    let promises = []
    let totalScore = 0
    let totalAnswerScores = 0 //if we want to give weight 
    let scoreOut20 = 0
    // console.log('data', data);
    promises.push(new Promise((resolve, reject) => {

        userQuizModel.findOne({ quiz: data.quiz, user: extra.session.user }).lean().then((current) => {
            if (current) {
                console.log("current: ", current);
                questionModel.find({ quiz: current.quiz }).then((questions) => {
                    if (questions.length > 0) {
                        let scorePromises = []
                        for (let i = 0; i < questions.length; i++) {
                            let question = questions[i]
                            scorePromises.push(new Promise((mresolve, reject) => {

                                let index = 0
                                question.answers.forEach(answer => {

                                    if (current.answers && current.answers[question._id] == answer._id) {
                                        totalScore = totalScore + (answer.score ? answer.score : 0)

                                    }
                                    index++
                                    console.log("idnex: ", index)
                                    if (index == question.answers.length) {
                                        // console.log("end of foreach")
                                        mresolve()
                                    }

                                })

                            }))
                        }

                        Promise.all(scorePromises).then(() => {
                            scoreOut20 =((20*(totalScore )/questions.length))
                            resolve()
                        })
                    } else {
                        resolve()

                    }
                })
            }

        }).catch((err) => {
            console.log(err)
        })

    }))
    Promise.all(promises).then(() => {
        userQuizModel.findOneAndUpdate({ quiz: data.quiz, user: extra.session.user }, { finishTime: new Date(), uDate: new Date(), score: scoreOut20 }, { new: true }).populate('quiz').lean().then((current) => {

            console.log('scoreeeeeeeeeeeee', current);
        userCourseModel.findOneAndUpdate({ course: current.quiz.course, user: extra.session.user }, { quizDate: new Date(), score: scoreOut20 }, { new: true }).then((userCourse) => {

            console.log('scoreeeeeeeeeeeee------------', current);
            console.log('score', userCourse);

            security.sendResponse(res, { done: true, info: current, data:userCourse  }, 200, 'simpleJson')
        })
        })
    })
}

async function getCurrentQuiz(data, res, extra) {
    userQuizModel.findOne({ user: extra.session.user, quiz: data.quiz }).then((current) => {

        security.sendResponse(res, { done: true, info: current }, 200, 'simpleJson')

    })
        .catch(() => { security.sendSomethingWrong(res) })



}


async function submitAnswer(data, res, extra) {

    // console.log('submitAnswer', data);
    userQuizModel.findOneAndUpdate({ user: extra.session.user, quiz: data.quiz }, {
        ['answers.' + data.question]: data.answer
    }).then((currentQuiz) => {

        security.sendResponse(res, { done: true, info: currentQuiz }, 200, 'simpleJson')


    }).catch(() => { security.sendSomethingWrong(res) })




}












module.exports = myApiSwitcher