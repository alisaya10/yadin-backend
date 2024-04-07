//? model
const userCourseModel = require('../models/userCourseModel');

//? useful
const useful = require('../utils/useful');

//? security
const security = require('../security');
const courseModel = require('../models/courseModel');
const { addToGroup } = require('./messenger');


let apisList = {

    'userCourse/getUserCourses': { function: getUserCourses, security: null },


    'userCourse/postUserCourse': { function: postUserCourse, security: null },

    'userCourse/removeUserCourse': { function: removeUserCourse, security: null },


    'userCourse/getOne': { function: getOne, security: null },
    'userCourse/videoPaused': { function: videoPaused, security: null },
    'userCourse/videoEnded': { function: videoEnded, security: null },
    'userCourse/getCurrentLessonCourse': { function: getCurrentLessonCourse, security: null },
    'userCourse/getCurrentLesson': { function: getCurrentLesson, security: null },
    'userCourse/getDetails': { function: getDetails, security: null },



}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions



// async function getOneUserCourse(data, res, extra) {


//     userCourseModel.findOne({_id:data.id}).then((doc)=>{
//         security.sendResponse(res, { info: doc }, 200, 'simpleJson')
//     })

// }


async function getOne(data, res, extra) {

    let filter = data
    filter.user= extra.session.user
    filter.removed= false

    userCourseModel.findOne(filter).populate([{ path: 'course', select: 'title image' }]).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}
async function getCurrentLessonCourse(data, res, extra) {

    let filter = data

    userCourseModel.findOne({ user: extra.session.user, course : data.course, removed : false }).populate([{ path: 'currentLesson' }, { path: 'course', select: 'title image' }]).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}
async function getCurrentLesson(data, res, extra) {

    let filter = data

    userCourseModel.findOne({ user: extra.session.user,  removed : false }).sort({ pDate: -1 }).populate([{ path: 'currentLesson' }, { path: 'course', select: 'title image' }]).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}
async function getDetails(data, res, extra) {

    let filter = data

    userCourseModel.find({ user: extra.session.user }).populate('course').lean().then((docs) => {
        let details= {}
        if (docs) {
            let passedCount = 0
            let booksCount = 0
            let boughtCount = docs.length
            for (let i = 0; i < docs.length; i++) {
                const userCourse = docs[i];
                if (userCourse.score >= 10) {
                    passedCount = passedCount + 1
                }
                booksCount = booksCount + (userCourse.course.books ?? 0)
            }
            details.passedCount = passedCount
            details.booksCount = booksCount
            details.boughtCount = boughtCount
console.log('-----------------',details);
            security.sendResponse(res, { info: details  }, 200, 'simpleJson')
        }else{

            security.sendResponse(res, { info: details  }, 200, 'simpleJson')
        }


    }).catch(() => { security.sendSomethingWrong(res) })

}

async function videoPaused(data, res, extra) {

    let filter = data

    userCourseModel.updateOne({ course: data.course, user: extra.session.user }, { currentLesson: data.lesson, currentLessontime: data.currentLessontime, course: data.course, pDate: new Date() }).populate([{ path: 'lesson', select: 'title image' }, { path: 'teacher', select: 'name image description affiliation' }]).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}

async function videoEnded(data, res, extra) {

    let filter = data

    userCourseModel.findOne({ course: data.course, user: extra.session.user }).then((doc) => {
        let watchedLessons = []
        for (let i = 0; i < doc.watchedLessons.length; i++) {
            const element = doc.watchedLessons[i];
            watchedLessons.push(String(element))
        }
        // console.log('watchedLessons.includes(data.lesson)',!watchedLessons.includes(String(data.lesson)),watchedLessons);

        if(!watchedLessons.includes(String(data.lesson))){
            watchedLessons.push(data.lesson)
        }
    userCourseModel.updateOne({ course: data.course, user: extra.session.user }, {

       watchedLessons:watchedLessons
    }).then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })
    }).catch(() => { security.sendSomethingWrong(res) })

}




// async function getSpecialBlogs(data, res, extra) {
//     // console.log("getSpecialBlogs")
//     let filter = { special: { $exists: true, $not: { $size: 0 } } }
//     filter.removed = false

//     if (data.lng != null) {
//         filter['lng'] = data.lng
//     }


//     blogsModel.find(filter).lean().select({ body: 0 }).then((docs) => {


//         security.sendResponse(res, { info: docs }, 200, 'simpleJson')

//     }).catch(() => { security.sendSomethingWrong(res) })


// }




// async function getRecommendedBlogs(data, res, extra) {


//     let filter = data.filter ? data.filter : {}
//     filter.removed = false
//     if (data.lng != null) {
//         filter['lng'] = data.lng
//     }


// blogsModel.findOne({ _id: data._id }).then((blog) => {

//     if (blog && blog._id) {
//         filter['_id'] = { $ne: blog._id }
//         filter['categories'] = { $in: blog.categories }

//     }

//     blogsModel.aggregate([
//         { $match: filter },
//             { $sample: { size: 4 } },
//             { $project: { body: 0 } }
//         ]).then((docs) => {

//             security.sendResponse(res, { info: docs }, 200, 'simpleJson')

//         }).catch(() => { security.sendSomethingWrong(res) })
//     }).catch(() => { security.sendSomethingWrong(res) })


// }


// async function searchBlogs(data, res, extra) {

//     let myRegex = new RegExp([data.search].join(""), "i")

//     let filter = { 'title': { $regex: myRegex } }
//     filter.removed = false
//     if (data.lng != null) {
//         filter['lng'] = data.lng
//     }

//     blogsModel.find(filter).lean().limit(20).select({ body: 0 }).then((docs) => {

//         security.sendResponse(res, { info: docs }, 200, 'simpleJson')

//     }).catch(() => { security.sendSomethingWrong(res) })

// }




// async function getOneBlog(data, res, extra) {

//     let filter = data

//     blogsModel.findOne(filter).populate('teacher').lean().then((doc) => {

//         security.sendResponse(res, { info: doc }, 200, 'simpleJson')

//     }).catch(() => { security.sendSomethingWrong(res) })

// }

async function postUserCourse(data, res, extra) {
    console.log('postcourse')
    console.log('postcourse')


    let isNew = true
    if (data._id) {
        isNew = false
    }
    // console.log("postBlog",isNew)

    // checkSlug(data, () => {

    if (isNew) {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug
        userCourseModel.create({
            course: data.course,
            user: extra.session.user,
            currentLesson: data.currentLesson,
            currentLessontime: data.currentLessontime,
            watchedLessons: data.watchedLessons,
            tags: data.tags,
            special: data.special,
            teacher: data.teacher,

            cDate: new Date(),
            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }).then((result) => {
            let obj = {
                user: extra.session.user,
                course: data.course
            }
            addToGroup(obj, () => {
                security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
                courseModel.updateOne({ _id: data.course }, { $inc: { userCount: 1 } }).then(() => { })
            })
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {
        let slug = useful.convertToSlug(data.slug)
        data.slug = slug

        userCourseModel.findOneAndUpdate({ _id: data._id }, {
            course: data.course,
            currentLesson: data.currentLesson,
            currentLessontime: data.currentLessontime,
            watchedLessons: data.watchedLessons,
            tags: data.tags,
            special: data.special,
            teacher: data.teacher,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')

        }).catch(() => { security.sendSomethingWrong(res) })
    }
    // })
}
// async function postUserCourse(data, res, extra) {
//     console.log('post',data)

//     let isNew = true
//     if (data._id) {
//         isNew = false
//     }
//     console.log("postBlog",isNew)

//     // checkSlug(data, () => {

//     if (isNew) {
//         let slug = useful.convertToSlug(data.title)
//         data.slug = slug
//         userCourseModel.create({
//             image: data.image,
//             course: data.course,
//             user: extra.session.user,
//             title: data.title,
//             slug: slug,
//             categories: data.categories,
//             description: data.description,
//             body: data.body,
//             lng: data.lng,
//             tags: data.tags,
//             special: data.special,
//             teacher: data.teacher,

//             cDate: new Date(),
//             uDate: new Date(),
//             creator: extra.session.user,
//             removed: false
//         }).then((result) => {
//             security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
//         }).catch(() => { security.sendSomethingWrong(res) })

//     } else {
//         let slug = useful.convertToSlug(data.slug)
//         data.slug = slug

//         userCourseModel.findOneAndUpdate({ _id: data._id }, {
//             image: data.image,
//             title: data.title,
//             course: data.course,
//             user: extra.session.user,
//             slug: slug,
//             categories: data.categories,
//             description: data.description,
//             body: data.body,
//             lng: data.lng,
//             tags: data.tags,
//             special: data.special,
//             teacher: data.teacher,
//             uDate: new Date(),
//         }, { new: true }).then((result) => {
//             security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
//         }).catch(() => { security.sendSomethingWrong(res) })
//     }
//     // })
// }




// async function checkSlug(data, cb) {

//     let slug = useful.convertToSlug(data.title)
//     console.log(slug)
//     data.slug = slug
//     cb()
// }


async function getUserCourses(data, res, extra) {
    // console.log('ooooooooooooooooooooobject');

    // let filter = data.filter ? useful.filterCreator(data.filter) : {}
    // let sort = data.sort ? data.sort : { cDate: -1 }
    // let limit = data.limit ? data.limit : null
    // let skip = data.skip ? data.limit * data.skip : null

    // if (data.lng != null) {
    //     filter['lng'] = data.lng
    // }

    // filter.removed = false

    userCourseModel.find({ user: extra.session.user }).lean().populate('course').then((docs) => {

        if (data.getCount) {
            userCourseModel.find(filter).count().then((count) => {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            })
        } else {
            security.sendResponse(res, { info: docs }, 200, 'simpleJson')
        }

        // security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}


async function removeUserCourse(data, res, extra) {

    // console.log('remove',data)
    userCourseModel.remove({ course: data.course }).then(() => {

        security.sendResponse(res, { done: true }, 200, 'simpleJson')
        courseModel.updateOne({ _id: data.course }, { $inc: { userCount: -1 } }).then(() => { })

    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}
// async function removeUserCourse(data, res, extra) {

//     console.log('remove',data)
//     userCourseModel.updateOne({ course: data.course }, {
//         removed: true
//     }, { upsert: false }).then(() => {

//         security.sendResponse(res, { done: true }, 200, 'simpleJson')

//     }).catch((err) => {
//         console.log(err);
//         security.sendSomethingWrong(res)
//     })

// }



module.exports = myApiSwitcher