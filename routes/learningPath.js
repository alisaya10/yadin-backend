const learningPathModel = require('../models/learningPathModel');
const useful = require('../utils/useful')
const security = require('../security');
const wishListModel = require('../models/wishListModel');
const courseModel = require('../models/courseModel');


let apisList = {

    // 'learningPaths/getLearningPaths': { function: getLearningPaths, security: null },
    // 'learningPaths/getOnelearningPath': { function: getOnelearningPath, security: null },

    'learningPath/addToLearningPath': { function: addToLearningPath, security: null },
    'learningPath/updatePath': { function: updatePath, security: null },
    'learningPath/removeFromLearningPath': { function: removeFromLearningPath, security: null },
    // 'learningPaths/removeLearningPath': { function: removeLearningPath, security: null },

    'learningPath/getOne': { function: getOne, security: null },




}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
// console.log("Here!", extra?.session?.user)
// console.log("course", course._id)
// course: {$elemMatch: {course:course._id}}
async function getOne(data, res, extra) {
    let filter = data

    learningPathModel.findOne({ user: extra.session.user }).populate('course').lean().then((doc) => {
        let promises = []
        if (doc && Array.isArray(doc.course)) {



            doc.course.forEach(course => {

                promises.push(new Promise((resolve, reject) => {


                    courseModel.findOne({ _id: course._id, removed: false }).populate('teacher').lean().then((courses) => {
                        if (courses) {
                            course['teacher'] = courses.teacher
                        }
                        wishListModel.findOne({ user: extra?.session?.user, course: course._id, removed: false }).populate('course').lean().then((inWishlist) => {
                            // console.log("inWishlist")
                            // console.log(inWishlist)

                            if (inWishlist) {
                                course['liked'] = true
                            }
                            resolve()
                        })
                    })
                }))

            });

            Promise.all(promises).then(() => {

console.log('--------------------',doc);
                security.sendResponse(res, { info: doc }, 200, 'simpleJson')
            })

        }
    }).catch(() => { security.sendSomethingWrong(res) })

}

async function updatePath(data, res, extra) {
    console.log('pppppppppppppppppppppp',data);
    let filter = {}
    if (data.org) {
        filter.organizationGroup = data.org
    } else {
        filter.user = extra.session.user
    }
    filter.removed = false
    
    learningPathModel.findOneAndUpdate(filter, {
        course: data.course ,
        uDate: new Date(),
    }, { new: true }).then((result) => {
        console.log('pppppppppppppppppppppp',result);

        security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
    }).catch(() => { security.sendSomethingWrong(res) })






}
async function addToLearningPath(data, res, extra) {
    console.log('addl', data)

    let promises = []
    learningPathModel.findOne({ user: extra.session.user, course: data.course }).populate('course').lean().then((exist) => {
        if (exist) {
            security.sendResponse(res, { done: true }, 200, 'simpleJson')


        } else {

            learningPathModel.findOne({ user: extra.session.user }).populate('course').lean().then((doc) => {
                if (!doc) {

                    promises.push(new Promise((resolve, reject) => {

                        learningPathModel.create({
                            user: extra.session.user,
                            cdate: new Date(),
                            uDate: new Date()

                        }).then(() => {

                            resolve()

                        })
                    }))

                }

                Promise.all(promises).then(() => {

                    learningPathModel.findOneAndUpdate({ user: extra.session.user }, {
                        $push: { course: data.course },
                        uDate: new Date(),
                    }, { new: true }).then((result) => {
                        security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
                    }).catch(() => { security.sendSomethingWrong(res) })

                })



            })
        }
    })
}
async function removeFromLearningPath(data, res, extra) {
    console.log('removel', data)

    // console.log("postBlog")
    // let isNew = true
    // if (data._id) {
    //     isNew = false
    // }

    // checkSlug(data, () => {


    learningPathModel.findOneAndUpdate({ user: extra.session.user }, {
        $pull: { course: data.course },
        uDate: new Date(),
    }, { new: true }).then((result) => {
        security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
    }).catch(() => { security.sendSomethingWrong(res) })

    // })
}
// async function getLearningPaths(data, res, extra) {

//     let filter = data.filter ? useful.filterCreator(data.filter) : {}
//     let sort = data.sort ? data.sort : { cDate: -1 }
//     let limit = data.limit ? data.limit : null
//     let skip = data.skip ? data.limit * data.skip : null

//     if (data.lng != null) {
//         filter['lng'] = data.lng
//     }

//     filter.removed = false

//     userLessonModel.find(filter).lean().sort(sort).limit(limit).skip(skip).populate('lessons').populate('courses').then((docs) => {

//         if (data.getCount) {
//             userLessonModel.find(filter).count().then((count) => {
//                 security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
//             })
//         } else {
//             security.sendResponse(res, { info: docs }, 200, 'simpleJson')
//         }

//         // security.sendResponse(res, { info: docs }, 200, 'simpleJson')

//     }).catch(() => { security.sendSomethingWrong(res) })

// }


// async function removeLearningPath(data, res, extra) {

//     // console.log(data)
//     userLessonModel.updateOne({ _id: data.id }, {
//         removed: true
//     }, { upsert: false }).then(() => {

//         security.sendResponse(res, { done: true }, 200, 'simpleJson')

//     }).catch((err) => {
//         console.log(err);
//         security.sendSomethingWrong(res)
//     })

// }
module.exports = myApiSwitcher