const useful = require('../utils/useful')
const security = require('../security');

const userQuizModel = require('../models/userQuizModel');
const questionModel = require('../models/questionModel');
const userPracticeModel = require('../models/userPracticeModel');
const practiceModel = require('../models/practiceModel');
const userCourseModel = require('../models/userCourseModel');

// const contentModel = require('../models/contentModel');


let apisList = {




    'userPractice/startPractice': { function: startPractice, security: null },
    'userPractice/endPractice': { function: endPractice, security: null },
    'userPractice/getCurrentPractice': { function: getCurrentPractice, security: null },
    'userPractice/submitAnswer': { function: submitAnswer, security: null },
    'userPractice/getUserPractices': { function: getUserPractices, security: null },

}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions


// async function getMainCategories(data, res, extra) {

//     contentModel.find({}).lean().then((categories) => {

//     })


// }
async function getUserPractices(data, res, extra) {

    // console.log('ooooooooooooooooooooobjects');
    let filter = data.filter

    filter.user = extra.session.user
    filter.removed = false

    practiceModel.find(filter).lean().then((practices) => {
        let promises = []
        promises.push(new Promise((resolve, reject) => {

            practices.forEach(practice => {

                userPracticeModel.findOne({ practice: practice._id }).lean().populate('practice').then((doc) => {
                    practice.score = doc.score
                })
            });

        }))
        Promise.all(promises).then(() => {
            security.sendResponse(res, { info: practices }, 200, 'simpleJson')
        })

    })

}



async function startPractice(data, res, extra) {

    // console.log('startQuiz')

    userPracticeModel.remove({ user: extra.session.user, practice: data.practice }).then(() => {

        userPracticeModel.create({
            user: extra.session?.user,
            practice: data.practice,
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
async function endPractice(data, res, extra) {
    let promises = []
    let totalScore = 0
    let scoreOut20 = 0
    // console.log('data',data);
    promises.push(new Promise((resolve, reject) => {

        userPracticeModel.findOne({ practice: data.practice, user: extra.session.user }).then((current) => {
            if (current) {
                // console.log("current: ", current);
                questionModel.find({ practice: current.practice }).then((questions) => {
                    if (questions.length > 0) {
                        let scorePromises = []
                        for (let i = 0; i < questions.length; i++) {
                            let question = questions[i]
                            scorePromises.push(new Promise((mresolve, reject) => {

                                let index = 0
                                question.answers.forEach(answer => {

                                    if (current.answers && current.answers[question._id] == answer._id) {
                                        totalScore = totalScore + (answer.score ? answer.score : 0)
                                        console.log('scoooreee', answer, totalScore);
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
                            scoreOut20 = ((20 * (totalScore) / questions.length))
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
        userPracticeModel.findOneAndUpdate({ practice: data.practice, user: extra.session.user }, { finishTime: new Date(), uDate: new Date(), score: totalScore }, { new: true }).then((current) => {
            // console.log('score',scoreOut20);
            practiceModel.findOne({ _id: current.practice }).then((practice) => {
                userCourseModel.findOne({ course: practice.course, user: extra.session.user }).lean().then((userCourse) => {
                    let donePractices = []
                    if(userCourse.donePractices){
                        for (let i = 0; i < userCourse.donePractices.length; i++) {
                            const element = userCourse.donePractices[i];
                            donePractices.push(String(element))
                            
                        }
                    }
                    if (!donePractices.includes(String(practice._id)) && scoreOut20 >= 10) {
                        donePractices.push(practice._id)
                        userCourseModel.findOneAndUpdate({ course: practice.course, user: extra.session.user }, { donePractices: donePractices },{new:true}).then((userCourse) => {
                            // console.log('score',userCourse,String(practice._id));

                            security.sendResponse(res, { done: true, info: current }, 200, 'simpleJson')
                        })
                    } else {
                        security.sendResponse(res, { done: true, info: current }, 200, 'simpleJson')

                    }
                    // let found =false
                    // for (let i = 0; i < donePractices.length; i++) {
                    //     const element = donePractices[i];
                    //     if(element._id == practice._id){
                    //         found = true
                    //     }
                    // }
                    // if(!found){

                    //     donePractices.push(practice)
                    // }
                })
            })

        })
    })
}

async function getCurrentPractice(data, res, extra) {
    userPracticeModel.findOne({ user: extra.session.user, practice: data.practice }).then((current) => {

        security.sendResponse(res, { done: true, info: current }, 200, 'simpleJson')

    })
        .catch(() => { security.sendSomethingWrong(res) })



}


async function submitAnswer(data, res, extra) {

    // console.log('submitAnswer', data);
    userPracticeModel.findOneAndUpdate({ user: extra.session.user, practice: data.practice }, {
        ['answers.' + data.question]: data.answer
    }).then((currentQuiz) => {

        security.sendResponse(res, { done: true, info: currentQuiz }, 200, 'simpleJson')


    }).catch(() => { security.sendSomethingWrong(res) })




}












module.exports = myApiSwitcher