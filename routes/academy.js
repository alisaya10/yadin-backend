// const blogsModel = require('../websiteModels/blogsModel');
const useful = require('../utils/useful')
const security = require('../security');
const courseModel = require('../models/courseModel');
const userModel = require('../models/userModel');
const learningPathModel = require('../models/learningPathModel');

const lessonModel = require('../models/lessonModel');
const practiceModel = require('../models/practiceModel');
const wishListModel = require('../models/wishListModel');
const userCourseModel = require('../models/userCourseModel');
const playStatusModel = require('../models/playStatusModel');
const { wishList } = require('../routes');
const { forever } = require('request-promise');
const { FieldValueInstance } = require('twilio/lib/rest/autopilot/v1/assistant/fieldType/fieldValue');
const notesModel = require('../models/notesModel');
const quizModel = require('../models/quizModel');
const userPracticeModel = require('../models/userPracticeModel');
const { createGroup } = require('./messenger');
const questionModel = require('../models/questionModel');
// const contentModel = require('../models/contentModel');


let apisList = {

    'academy/getCourses': { function: getCourses, security: null },
    'academy/getCoursesPanel': { function: getCoursesPanel, security: null },
    'academy/getCoursesNotes': { function: getCoursesNotes, security: null },
    'academy/getCoursesPractices': { function: getCoursesPractices, security: null },
    'academy/getCoursesQuizes': { function: getCoursesQuizes, security: null },
    'academy/getOneCourse': { function: getOneCourse, security: null },
    'academy/postCourse': { function: postCourse, security: null },
    'academy/removeCourse': { function: removeCourse, security: null },
    'academy/searchCourses': { function: searchCourses, security: null },
    'academy/getSpecialCourses': { function: getSpecialCourses, security: null },



    'academy/getLessons': { function: getLessons, security: null },
    'academy/getOneLesson': { function: getOneLesson, security: null },
    'academy/postLesson': { function: postLesson, security: null },
    'academy/getSpecialLessons': { function: getSpecialCourses, security: null },
    'academy/removeLesson': { function: removeLesson, security: null },
    'academy/playStatus': { function: playStatus, security: null },

    // 'academy/getMainCategories': { function: getMainCategories, security: null }, 
    'academy/getPractices': { function: getPractices, security: null },
    'academy/getUserPractices': { function: getUserPractices, security: null },
    'academy/getOnePractice': { function: getOnePractice, security: null },
    'academy/postPractice': { function: postPractice, security: null },
    'academy/removePractice': { function: removePractice, security: null },
    'academy/searchPractices': { function: searchPractices, security: null },


    'academy/getTeacher': { function: getTeacher, security: null },
}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions


// async function getMainCategories(data, res, extra) {

//     contentModel.find({}).lean().then((categories) => {

//     })


// }
async function playStatus(data, res, extra) {

    let filter = data.filter
    if (extra.session.user) {
        filter['user'] = extra.session.user
    }
    let update = {
        course: data.course,
        lesson: data.lesson,
        lastPauseTime: data.lastPauseTime,
        uDate: new Date()
    }


    playStatusModel.findOneAndUpdate(filter, update, { upsert: false }).then((doc) => {

        security.sendResponse(res, { status: 200, info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}

async function getOneLesson(data, res, extra) {
    let filter = data
    let myLessons = []
    let myCourse

    // console.log("getOneLesson", extra)
    // console.log(data);
    // console.log(filter._id)


    lessonModel.findOne(filter).populate('course').lean().then((doc) => {
        let promises = []
        promises.push(new Promise((resolve, reject) => {
            // console.log('doc',doc.course._id);

            courseModel.findOne({ _id: doc.course._id, removed: false }).lean().then((course) => {
                // console.log('couuuuuuuuuuuuuuurse',course);
                myCourse = course
                resolve()
                // console.log('couuuuuuuuuuuuuuurse',myCourse);
            })
        }))
        promises.push(new Promise((resolve, reject) => {
            lessonModel.find({ course: doc.course?._id, removed: false }).sort({ priority: -1 }).lean().then((lessons) => {
                userModel.findOne({ _id: extra.session.user }).lean().then((user) => {

                    console.log('lesssssssssssssssssons', lessons);
                    myLessons = lessons
                    let likedPromisses = []
                    for (let index = 0; index < myLessons.length; index++) {
                        const element = myLessons[index];
                        if (user.status == 'admins') {
                            element.locked = false
                        } else {

                            likedPromisses.push(new Promise((lresolve, lreject) => {

                                userCourseModel.findOne({ user: extra?.session?.user, course: doc.course?._id }).lean().then((bought) => {

                                    console.log("usercourse: ", bought)
                                    if (!bought) {
                                        if (element.locked && element.video) {
                                            delete element.video.address
                                        }
                                    } else {
                                        element.locked = false
                                    }



                                    // if (index == lessons.length - 1) {
                                    //     console.log("end of foreach")
                                    lresolve()
                                    // }
                                })
                            }))
                        }
                        // console.log('tp user', extra.session.user)
                        // console.log('tp element', element._id)
                        likedPromisses.push(new Promise((lresolve, lreject) => {
                            wishListModel.findOne({ user: extra?.session?.user, lesson: element._id, removed: false }).lean().then((inWishlist) => {
                                // console.log("inWishlist")
                                // console.log(inWishlist)

                                if (inWishlist) {
                                    element['liked'] = true
                                }
                                lresolve()
                            })

                        }))

                    }
                    Promise.all(likedPromisses).then(() =>
                        resolve()
                    )
                })

            })
        }))

        Promise.all(promises).then(() => {
            myLessons.sort((a, b) => b.priority - a.priority)

            security.sendResponse(res, { status: 200, info: doc, lessons: myLessons, course: myCourse }, 200, "simpleJson")
        }).catch(() => { security.sendSomethingWrong(res) })
    })

}







async function postLesson(data, res, extra) {

    // console.log('PostLesson')
    let promises = []

    let courseIsChanged = false
    let lesson
    if (!data._id) {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug


    } else {

        promises.push(new Promise((resolve, reject) => {

            lessonModel.findOne({ _id: data._id }).then((mlesson) => {
                // console.log('fiiiiiiiiiiiiiiiiiiiiiiiiiiiinded')
                let courseId = typeof data.course == 'object' ? data.course._id : data.course
                if (mlesson.course != courseId) {
                    courseIsChanged = true
                    lesson = mlesson
                }
                resolve()

            }).catch((err) => {
                console.log(err)
            })

        }))
    }

    let object = {
        teaser: data.teaser,
        video: data.video,
        files: data.files,
        image: data.image,
        title: data.title,
        teacher: data.teacher,
        slug: data.slug,
        categories: data.categories,
        description: data.description,
        course: data.course,
        body: data.body,
        lng: data.lng,
        tags: data.tags,
        special: data.special,
        priority: data.priority,
        currentLessonTime: data.currentLessonTime,
        locked: data.locked

    }


    // console.log('TP1')




    Promise.all(promises).then(() => {

        // console.log('2313')

        let populates = [{ path: 'course', select: 'title image' }, { path: 'teacher', select: 'name image description affiliation' }]

        useful.postQuery(data, res, extra, "lessons", object, populates, (queryResult, err) => {


            // console.log('TP2')


            if (!err) {
                security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
                // console.log("course is change: ", courseIsChanged);
                // console.log("course_id: ", data._id);
                // console.log("lesson: ", lesson);
                if (!data._id || courseIsChanged) {
                    courseModel.updateOne({ _id: data.course }, { $inc: { lessonsCount: 1 } }).then(() => { })
                    if (lesson && courseIsChanged) {
                        courseModel.updateOne({ _id: lesson.course }, { $inc: { lessonsCount: -1 } }).then(() => { })
                    }
                }

            } else {
                // console.log(err)
                security.sendSomethingWrong(res)
            }
        })
    }).catch(() => {
        security.sendSomethingWrong(res)
    })

}




async function getLessons(data, res, extra) {
    // console.log("getLessons")
    // console.log("data: ", data)
    let totalDuration = 0
    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        wrapperRes.populates = [{ path: 'course', select: 'title image' }, { path: 'teacher', select: 'name image description affiliation' }],


            useful.findQuery(data, res, extra, "lessons", wrapperRes, (docs, count, err) => {
                if (err) {
                    console.log(err)
                    security.sendSomethingWrong(res)
                } else {
                    // console.log("lessons: ", docs)
                    if (docs.length > 0) {
                        new Promise((resolve, reject) => {
                            let index = 0
                            docs.forEach(lesson => {

                                if (lesson.video) {
                                    totalDuration += lesson.video.duration
                                }
                                index++

                                if (index == docs.length) {
                                    // console.log("end of foreach")
                                    resolve()
                                }

                            })
                        }).then(() => {
                            security.sendResponse(res, { info: docs, count, totalDuration }, 200, 'simpleJson')
                        })

                    } else {
                        security.sendResponse(res, { info: docs, count, totalDuration }, 200, 'simpleJson')
                    }

                }
            });
    })
}



async function removeLesson(data, res, extra) {

    // console.log("data in remove lesson: ", data)
    lessonModel.updateOne({ _id: data.id }, {
        removed: true
    }, { upsert: false }).then(() => {

        security.sendResponse(res, { done: true }, 200, 'simpleJson')
        courseModel.updateOne({ _id: data.course }, { $inc: { lessonsCount: -1 } }).then(() => { })

    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}







async function getSpecialCourses(data, res, extra) {

    let filter = { special: { $exists: true, $not: { $size: 0 } } }
    filter.removed = false

    if (data.lng != null) {
        filter['lng'] = data.lng
    }

    courseModel.find(filter).lean().select({ body: 0 }).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })


}


async function searchCourses(data, res, extra) {

    let myRegex = new RegExp([data.text].join(""), "i")
    // let myRegexx = new RegExp([data.text].join(""), "i")
    let filter = { $or: [{ 'title': { $regex: myRegex } }, { 'description': { $regex: myRegex } }] }
    filter.removed = false
    // if (data.lng != null) {
    //     filter['lng'] = data.lng
    // }

    courseModel.find(filter).populate({ path: 'categories', select: 'name image' }).populate({ path: 'teacher', select: 'name image description affiliation' }).lean().limit(20).select({ body: 0 }).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}



async function getOneCourse(data, res, extra) {
    let filter = data
    filter.removed = false
    // console.log("getOneCourse")
    courseModel.findOne(filter).populate({ path: 'categories', select: 'name image' }).populate('group').populate({ path: 'teacher', select: 'name family fullname image description affiliation rating' }).lean().then((course) => {

        // console.log("course !! ", course)
        if (course) {
            // console.log("get one course: ", course);
            // if(course.price==0){
            //     let pricePromises = []

            //     pricePromises.push(new Promise((resolve, reject) => {

            //         userCourseModel.create({
            //             course: course._id,
            //             user: extra.session.user
            //         }).then(() => {
            //             resolve()
            //         }).catch((err) => {
            //             console.log(err)
            //             reject()
            //         })
            //     }))

            //     pricePromises.push(new Promise((resolve, reject) => {
            //         learningPathModel.updateOne({ user: extra.session.user }, {

            //             $push: { course: course }

            //         }).then(() => {
            //             resolve()
            //         }).catch((err) => {
            //             console.log(err)
            //             reject()
            //         })

            //     }))
            //     Promise.all(pricePromises).then(() => {
            //         resolve()
            //     })


            // } 
            let promises = []
            let finalLessons = []
            let totalDuration = 0
            let totalPracticeDuration = 0
            let finalPractices = []
            let newPromisesLock = []

            if (extra.session.user) {

                promises.push(new Promise((resolve, reject) => {
                    // console.log("Here!", extra?.session?.user)
                    // console.log("course", course._id)
                    userCourseModel.findOne({ user: extra?.session?.user, course: course._id }).lean().then((bought) => {
                        // console.log("usercourse: ", bought)
                        if (bought) {
                            // console.log('here2');
                            course['bought'] = true
                        }
                        wishListModel.findOne({ user: extra?.session?.user, course: course._id, removed: false }).lean().then((inWishlist) => {
                            // console.log("inWishlist")
                            // console.log(inWishlist)

                            if (inWishlist) {
                                course['liked'] = true
                            }
                            resolve()
                        })
                    })
                }))

                promises.push(new Promise((resolve, reject) => {
                    lessonModel.find({ course: course._id, removed: false }).sort({ priority: -1 }).lean().then((lessons) => {
                        userModel.findOne({ _id: extra.session.user }).lean().then((user) => {

                            // console.log("founded lessons: ", lessons)
                            // new Promise((lresolve, lreject) => {
                            let newPromises = []
                            // let foundUnDonePractice = false
                            // let pIndex = 0
                            for (let i = 0; i < lessons.length; i++) {
                                const les = lessons[i];
                                if (user?.status == 'admins') {
                                    les.locked = false
                                    finalLessons.push(les)
                                    if (les.video) {

                                        totalDuration += les.video.duration
                                    }


                                } else {

                                    newPromises.push(new Promise((lresolve, lreject) => {

                                        userCourseModel.findOne({ user: extra?.session?.user, course: course._id }).lean().then((bought) => {
                                            // console.log("usercourse: ", bought)
                                            if (!bought) {
                                                if (les.locked && les.video) {
                                                    delete les.video.address
                                                }
                                            } else {
                                                les.locked = false
                                                // let watchedLessons = []
                                                // for (let i = 0; i < bought.watchedLessons.length; i++) {
                                                    //     const element = bought.watchedLessons[i];
                                            //     watchedLessons.push(String(element))
                                            // }
                                            // // console.log('watchedLessons.includes(data.lesson)',!watchedLessons.includes(data.lesson));

                                            // if(!watchedLessons.includes(String(data.lesson))){
                                            //     les.tempLock = true
                                            // }
                                            // if(bought.donePractices && bought.donePractices.length > 0){

                                            // }
                                            if (bought.watchedLessons && bought.watchedLessons.length > 0) {
                                                let donePractices = []
                                                if(bought.donePractices ){

                                                    for (let i = 0; i < bought.donePractices.length; i++) {
                                                        const element = bought.donePractices[i];
                                                        donePractices.push(String(element))
                                                    }
                                                }
                                                if (i > bought.watchedLessons.length ) {
                                                    les.tempLock = true
                                                }
                                                if (i == bought.watchedLessons.length - 1) {
                                                    // console.log('iiiiiiiiiiiii',i,donePractices);
                                                    newPromisesLock.push(new Promise((kresolve, kreject) => {
                                                        practiceModel.findOne({ lesson: les._id }).lean().then((practice) => {
                                                            // console.log('praccccccc',practice, !donePractices.includes(String(practice._id)),bought.watchedLessons.length,lessons[bought.watchedLessons.length]);
                                                            if (practice && !donePractices.includes(String(practice._id)) ){
                                                                // foundUnDonePractice = true
                                                                // pIndex= i+1
                                                                lessons[bought.watchedLessons.length].tempLock = true
                                                            }
                                                            kresolve()
                                                        })
                                                    }))
                                                    
                                                }
                                                
                                            }else{
                                                if (i > 0) {
                                                    les.tempLock = true
                                                }
                                            }
                                        }
                                            finalLessons.push(les)

                                            if (les.video) totalDuration += les.video.duration

                                            // if (index == lessons.length - 1) {
                                            //     console.log("end of foreach")
                                            Promise.all(newPromisesLock).then(() => {
                                                lresolve()
                
                                            })
                                            // }
                                        })
                                    }))
                                }

                            }


                            Promise.all(newPromises).then(() => {
                                // if(foundUnDonePractice){
                                //     // console.log('qqqqqqqqqqqqqqqqqqqqqqqqqq',finalLessons[pIndex] , pIndex );
                                //     finalLessons[pIndex].tempLock= true
                                // }
                                
                                // console.log('qqqqqqqqqqqqqqqqqqqqqqqqqq1111111111111',finalLessons );
                                resolve()

                            })
                        })
                    })
                }))
                promises.push(new Promise((resolve, reject) => {
                    practiceModel.find({ course: course._id, removed: false }).lean().then((practices) => {
                        // console.log("founded practices: ", practices)
                        let newPromises = []
                        practices.forEach((les, index) => {
                            newPromises.push(new Promise((lresolve, lreject) => {

                                userCourseModel.findOne({ user: extra?.session?.user, course: course._id }).lean().then((bought) => {
                                    // console.log("usercourse: ", bought)


                                    finalPractices.push(les)

                                    if (les.time) totalPracticeDuration += les.time

                                    // if (index == practices.length - 1) {
                                    //     console.log("end of foreach")
                                    lresolve()
                                    // }
                                })
                            }))
                        })


                        Promise.all(newPromises).then(() => {
                            resolve()

                        })

                    })
                }))

            } else {
                promises.push(new Promise((resolve, reject) => {
                    lessonModel.find({ course: course._id, removed: false }).sort({ priority: -1 }).lean().then((lessons) => {

                        console.log("founded lessons: ", lessons)
                        // new Promise((lresolve, lreject) => {
                        for (let i = 0; i < lessons.length; i++) {
                            const les = lessons[i];




                            if (les.locked && les.video) {
                                delete les.video.address
                            }


                            finalLessons.push(les)

                            if (les.video) totalDuration += les.video.duration

                            // if (index == lessons.length - 1) {
                            //     console.log("end of foreach")
                            // }

                        }


                        resolve()

                    })
                }))
                promises.push(new Promise((resolve, reject) => {
                    practiceModel.find({ course: course._id, removed: false }).lean().then((practices) => {
                        // console.log("founded practices: ", practices)
                        practices.forEach((les, index) => {

                            // console.log("usercourse: ", bought)


                            finalPractices.push(les)

                            if (les.time) totalPracticeDuration += les.time

                            // if (index == practices.length - 1) {
                            //     console.log("end of foreach")
                            // }
                        })


                        resolve()


                    })
                }))

            }

            Promise.all(promises).then(() => {
                finalLessons.sort((a, b) => b.priority - a.priority)
                // console.log('ttttttt',finalLessons);
                // console.log("total duration: ", totalDuration);
                // console.log("lessons: ", lessons);
                // console.log("course: ", course);
                security.sendResponse(res, { status: 200, course, lessons: finalLessons, totalDuration, totalPracticeDuration }, 200, "simpleJson")
            }).catch(() => {
                security.sendSomethingWrong(res)
            })

        } else {
            // console.log("dont found any course");
            security.sendResponse(res, { status: 401, message: 'do not found any courses' }, 401, "simpleJson")
        }
    })
}





async function postCourse(data, res, extra) {


    if (!data._id) {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug
    }

    // console.log('123456789', data);
    let groupData = {
        name: data.title,
        description: data.description,
        hubs: [data.teacher]
    }
    createGroup(groupData, extra, (group) => {


        let object = {
            image: data.image,
            rating: data.rating,
            price: data.price,
            teaser: data.teaser,
            books: data.books,
            level: data.level,
            course: data.course,
            lessonsTotalLength: data.lessonsTotalLength,
            practiceTotal: data.practiceTotal,
            lessons: data.lessons,
            lessonsCount: data.lessonsCount,
            title: data.title,
            orgOnly: data.orgOnly,
            slug: data.slug,
            categories: data.categories,
            description: data.description,
            audiance: data.audiance,
            achievements: data.achievements,
            difficulty: data.difficulty,
            lng: data.lng,
            tags: data.tags,
            special: data.special,
            usecases: data.usecases,
            teacher: data.teacher,
            quiz: data.quiz,
            group: group._id,
        }

        if (!data.rating) {
            object.rating = [
                {
                    total: { count: 0, star: 0 },
                    oneStar: { title: "1 star", count: 0, percent: 0 },
                    twoStar: { title: "2 star", count: 0, percent: 0 },
                    threeStar: { title: "3 star", count: 0, percent: 0 },
                    fourStar: { title: "4 star", count: 0, percent: 0 },
                    fiveStar: { title: "5 star", count: 0, percent: 0 }
                },
                {
                    total: { count: 0, star: 0 },
                    oneStar: { title: "1 star", count: 0, percent: 0 },
                    twoStar: { title: "2 star", count: 0, percent: 0 },
                    threeStar: { title: "3 star", count: 0, percent: 0 },
                    fourStar: { title: "4 star", count: 0, percent: 0 },
                    fiveStar: { title: "5 star", count: 0, percent: 0 }
                },
                {
                    total: { count: 0, star: 0 },
                    oneStar: { title: "1 star", count: 0, percent: 0 },
                    twoStar: { title: "2 star", count: 0, percent: 0 },
                    threeStar: { title: "3 star", count: 0, percent: 0 },
                    fourStar: { title: "4 star", count: 0, percent: 0 },
                    fiveStar: { title: "5 star", count: 0, percent: 0 }
                },
                {
                    total: { count: 0, star: 0 },
                    oneStar: { title: "1 star", count: 0, percent: 0 },
                    twoStar: { title: "2 star", count: 0, percent: 0 },
                    threeStar: { title: "3 star", count: 0, percent: 0 },
                    fourStar: { title: "4 star", count: 0, percent: 0 },
                    fiveStar: { title: "5 star", count: 0, percent: 0 }
                },
                {
                    total: { count: 0, star: 0 },
                    oneStar: { title: "1 star", count: 0, percent: 0 },
                    twoStar: { title: "2 star", count: 0, percent: 0 },
                    threeStar: { title: "3 star", count: 0, percent: 0 },
                    fourStar: { title: "4 star", count: 0, percent: 0 },
                    fiveStar: { title: "5 star", count: 0, percent: 0 }
                },
            ]
        }


        let promises = []


        Promise.all(promises).then(() => {
            // console.log('TP1')
            let populates = [{ path: 'categories', select: 'name image' }, { path: 'teacher', select: 'name image description affiliation' }, { path: 'group', select: 'users name description type creator accessLimit' }]

            useful.postQuery(data, res, extra, "courses", object, populates, (queryResult, err) => {
                // console.log(err)

                if (!err) {
                    // console.log("query result: ", queryResult)

                    security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
                }
            })
        }).catch(() => {
            security.sendSomethingWrong(res)
        })
    })

}




async function getCourses(data, res, extra) {

    console.log('get courses')
    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        // wrapperRes.filter.orgOnly = false
        wrapperRes.filter['$or'] = [{ orgOnly: false }, { orgOnly: null }, { orgOnly: undefined }]
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        // wrapperRes.populates = [{ path: 'categories', select: 'title image' }, { path: 'teacher', select: 'name image bio affiliation' }]
        wrapperRes.populates = [{ path: 'categories', select: 'name image' }, { path: 'teacher', select: 'name family fullname image description affiliation' }]

        // console.log(wrapperRes)
        useful.findQuery(data, res, extra, "courses", wrapperRes, (docs, count, err) => {
            if (err) {

                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                let promises = []
                docs.forEach(doc => {
                    // console.log('docssss', doc)

                    promises.push(new Promise((resolve, reject) => {
                        wishListModel.findOne({ user: extra?.session?.user, course: doc._id, removed: false }).populate('course').lean().then((inWishlist) => {
                            // console.log("inWishlist")
                            // console.log(inWishlist)

                            if (inWishlist) {
                                doc['liked'] = true
                            }
                            userCourseModel.findOne({ user: extra.session.user, course: doc._id, removed: false }).populate('lesson').lean().then((found) => {
                                if (found) {
                                    doc.bought = true
                                }
                                resolve()
                            })
                        })
                    }))

                });


                Promise.all(promises).then(() => {
                    console.log('----')
                    // console.log('000000000000000000000',docs)
                    security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
                })
                // console.log("courses: ", docs);
            }
        })
    })
}
async function getCoursesPanel(data, res, extra) {

    console.log('get courses')
    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        // wrapperRes.populates = [{ path: 'categories', select: 'title image' }, { path: 'teacher', select: 'name image bio affiliation' }]
        wrapperRes.populates = [{ path: 'categories', select: 'name image' }, { path: 'teacher', select: 'name family fullname image description affiliation' }]

        // console.log(wrapperRes)
        useful.findQuery(data, res, extra, "courses", wrapperRes, (docs, count, err) => {
            if (err) {

                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                let promises = []
                docs.forEach(doc => {
                    // console.log('docssss', doc)

                    promises.push(new Promise((resolve, reject) => {
                        wishListModel.findOne({ user: extra?.session?.user, course: doc._id, removed: false }).populate('course').lean().then((inWishlist) => {
                            // console.log("inWishlist")
                            // console.log(inWishlist)

                            if (inWishlist) {
                                doc['liked'] = true
                            }
                            userCourseModel.findOne({ user: extra.session.user, course: doc._id, removed: false }).populate('lesson').lean().then((found) => {
                                if (found) {
                                    doc.bought = true
                                }
                                resolve()
                            })
                        })
                    }))

                });


                Promise.all(promises).then(() => {
                    console.log('----')
                    // console.log('000000000000000000000',docs)
                    security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
                })
                // console.log("courses: ", docs);
            }
        })
    })
}
async function getCoursesNotes(data, res, extra) {


    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        // wrapperRes.populates = [{ path: 'categories', select: 'title image' }, { path: 'teacher', select: 'name image bio affiliation' }]
        wrapperRes.populates = [{ path: 'course' }, { path: 'lesson' }]

        // console.log(wrapperRes)
        useful.findQuery(data, res, extra, "userCourses", wrapperRes, (docs, count, err) => {
            if (err) {

                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                let promises = []

                docs.forEach(doc => {

                    promises.push(new Promise((resolve, reject) => {
                        notesModel.find({ user: extra.session.user, course: doc.course._id, removed: false }).populate('lesson').populate('course').then((notes) => {
                            doc.notes = notes
                            resolve()
                        })
                    }))

                });

                Promise.all(promises).then(() => {
                    security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
                })
                // console.log("courses: ", docs);
            }
        })
    })
}
async function getCoursesPractices(data, res, extra) {


    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        // wrapperRes.populates = [{ path: 'categories', select: 'title image' }, { path: 'teacher', select: 'name image bio affiliation' }]
        wrapperRes.populates = [{ path: 'course' }]

        console.log(wrapperRes)
        useful.findQuery(data, res, extra, "userCourses", wrapperRes, (docs, count, err) => {
            if (err) {

                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                let promises = []

                docs.forEach(doc => {

                    promises.push(new Promise((resolve, reject) => {
                        practiceModel.find({ user: extra.session.user, course: doc.course._id, removed: false }).then((practices) => {
                            doc.practices = practices
                            resolve()
                        })
                    }))

                });

                Promise.all(promises).then(() => {
                    security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
                })
                // console.log("courses: ", docs);
            }
        })
    })
}
async function getCoursesQuizes(data, res, extra) {


    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        // wrapperRes.populates = [{ path: 'categories', select: 'title image' }, { path: 'teacher', select: 'name image bio affiliation' }]
        wrapperRes.populates = [{ path: 'course' }]

        // console.log(wrapperRes)
        useful.findQuery(data, res, extra, "userCourses", wrapperRes, (docs, count, err) => {
            if (err) {

                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                let promises = []

                docs.forEach(doc => {

                    promises.push(new Promise((resolve, reject) => {
                        // console.log('-------------------',doc.course._id);
                        quizModel.find({ course: doc.course._id, removed: false }).then((quizes) => {
                            doc.quizes = quizes
                            resolve()
                        })
                    }))

                });
                docs.forEach(doc => {

                    promises.push(new Promise((resolve, reject) => {
                        practiceModel.find({ course: doc.course._id, removed: false }).then((practices) => {
                            doc.practices = practices
                            resolve()
                        })
                    }))

                });

                Promise.all(promises).then(() => {
                    security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
                })
                // console.log("courses: ", docs);
            }
        })
    })
}


async function removeCourse(data, res, extra) {

    // console.log(data)
    courseModel.updateOne({ _id: data.id }, {
        removed: true
    }, { upsert: false }).then(() => {
        userCourseModel.updateMany({ course: data.id }, {
            removed: true
        }, { upsert: false }).then(() => {
            learningPathModel.updateMany({}, {
                $pull: { course: data.id },
                uDate: new Date(),
            }, { new: true }).then((result) => {
                security.sendResponse(res, { done: true }, 200, 'simpleJson')
            }).catch(() => { security.sendSomethingWrong(res) })



        }).catch((err) => {
            console.log(err);
            security.sendSomethingWrong(res)
        })
    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}


async function getSpecialPractices(data, res, extra) {

    let filter = { special: { $exists: true, $not: { $size: 0 } } }
    filter.removed = false

    if (data.lng != null) {
        filter['lng'] = data.lng
    }

    practiceModel.find(filter).lean().select({ body: 0 }).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })


}


async function searchPractices(data, res, extra) {

    let myRegex = new RegExp([data.search].join(""), "i")

    let filter = { 'title': { $regex: myRegex } }
    filter.removed = false
    if (data.lng != null) {
        filter['lng'] = data.lng
    }

    practiceModel.find(filter).lean().limit(20).select({ body: 0 }).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}




async function getOnePractice(data, res, extra) {

    let filter = data


    practiceModel.findOne(filter).populate([{ path: 'course', select: 'title image' }, { path: 'lesson', select: 'title image' }]).lean().then((doc) => {
        questionModel.find({ practice: doc._id }).then((questions) => {

            userPracticeModel.findOne({ practice: doc._id, user: extra.session.user }).then((current) => {
                if (current) {


                    console.log("current: ", current);
                }
                security.sendResponse(res, { info: doc, current, questions }, 200, 'simpleJson')
            })
        })

    }).catch((ERR) => {
        console.log("current: ", ERR);

        security.sendSomethingWrong(res)
    })

}






async function postPractice(data, res, extra) {


    if (!data._id) {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug
    }


    let object = {
        image: data.image,
        title: data.title,
        time: data.time,
        slug: data.slug,
        categories: data.categories,
        description: data.description,
        level: data.level,
        lng: data.lng,
        tags: data.tags,
        special: data.special,
        teacher: data.teacher,
        files: data.files,
        lesson: data.lesson,
        course: data.course,
        status: data.status,
        body: data.body,
        image: data.image,
        time: data.time,
        score: data.score,
        question: data.question,

    }


    let promises = []


    lessonModel.findOne({ _id: data.lesson }).then((lesson) => {

        object.course = lesson.course

        // Promise.all(promises).then(() => {
        // console.log('TP1')
        let populates = [{ path: 'course', select: 'title image' }, { path: 'lesson', select: 'title image' }]

        useful.postQuery(data, res, extra, "practices", object, populates, (queryResult, err) => {
            // console.log(err)

            if (!err) {
                security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
            }
        })
            .catch(() => {
                security.sendSomethingWrong(res)
            })


    })



}




async function getPractices(data, res, extra) {


    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        wrapperRes.populates = [{ path: 'course', select: 'title image' }, { path: 'lesson', select: 'title image priority' }]

        console.log(wrapperRes)
        useful.findQuery(data, res, extra, "practices", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                docs.sort((a, b) => b.lesson.priority - a.lesson.priority)

                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}
async function getUserPractices(data, res, extra) {


    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        wrapperRes.populates = [{ path: 'course', select: 'title image' }, { path: 'lesson', select: 'title image priority' }]

        console.log(wrapperRes)
        useful.findQuery(data, res, extra, "practices", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                docs.sort((a, b) => b.lesson.priority - a.lesson.priority)
                userCourseModel.findOne({ course: data.filter.course, user: extra.session.user }).lean().then((userCourse) => {
                    if (userCourse) {

                        let watchedLessons = []
                        for (let i = 0; i < userCourse.watchedLessons.length; i++) {
                            const element = userCourse.watchedLessons[i];
                            watchedLessons.push(String(element))
                        }
                        // console.log('userCourse.watchedLessons', watchedLessons);
                        for (let i = 0; i < docs.length; i++) {
                            const element = docs[i];
                            // console.log('userCourse.watchedLessons', element.lesson._id, typeof element.lesson._id, !watchedLessons.includes(String(element.lesson._id)));
                            if (!watchedLessons.includes(String(element.lesson._id))) {
                                element.locked = true
                            }

                        }
                        security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
                    } else {
                        security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')

                    }
                })
            }
        })
    })
}


async function removePractice(data, res, extra) {

    // console.log(data)
    practiceModel.updateOne({ _id: data.id }, {
        removed: true
    }, { upsert: false }).then(() => {

        security.sendResponse(res, { done: true }, 200, 'simpleJson')

    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}
async function getTeacher(data, res, extra) {
    let teachercommission = 0
    userModel.findOne({ _id: data.id }).select('name family fullname image email description rating commission').lean().then((doc) => {

        if (doc) {
            courseModel.find({ teacher: doc._id, removed: false }).then((courses) => {
                // let promises = []
                // if (Array.isArray(courses)) {
                //     promises.push(new Promise((resolve, reject) => {
                //         for (let i = 0; i < courses.length; i++) {
                //             const element = courses[i];
                //             teachercommission = teachercommission  + (((element.price*(doc.commission ?? 20))/100)*element.userCount)
                //         }
                //         doc.totalcommission = teachercommission
                //         resolve()
                //     }))
                // }
                // Promise.all(promises).then(() => {
                // console.log('object',doc);
                security.sendResponse(res, { info: doc, courses }, 200, 'simpleJson')
                // })
            })
        } else {
            security.sendNotFound(res)
        }

    }).catch(() => { security.sendSomethingWrong(res) })

}




module.exports = myApiSwitcher