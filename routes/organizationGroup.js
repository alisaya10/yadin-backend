//? model
const organizationGroupModel = require('../models/organizationGroupModel');
const userCourseModel = require('../models/userCourseModel');
const users = require("../models/userModel");

//? useful
const useful = require('../utils/useful');

//? security
const security = require('../security');
const learningPathModel = require('../models/learningPathModel');
const { learningPath, userCourse } = require('../routes');
const { addToGroup } = require('./messenger');


let apisList = {

    'organizationGroup/getOrganizationGroups': { function: getOrganizationGroups, security: null },
    'organizationGroup/postOrganizationGroup': { function: postOrganizationGroup, security: null },
    'organizationGroup/removeOrganizationGroup': { function: removeOrganizationGroup, security: null },
    'organizationGroup/getOneOrganizationGroup': { function: getOneOrganizationGroup, security: null },
    'organizationGroup/getOrgUserLearningPath': { function: getOrgUserLearningPath, security: null },
    'organizationGroup/getMyOrganizationInfo': { function: getMyOrganizationInfo, security: null },
    'organizationGroup/getMyOrganizationUsersInfo': { function: getMyOrganizationUsersInfo, security: null },
    'organizationGroup/getMyOrganizationUserscourseInfo': { function: getMyOrganizationUserscourseInfo, security: null },





}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions
function getOrganizationGroups(data, res, extra) {
    useful.getWrapper(data, res, extra, (getWrapper) => {
        if (!getWrapper.filter) {
            getWrapper.filter = {}
        }
        getWrapper.filter.removed = false
        getWrapper.populates = [{ path: 'owner', select: 'fullname name phone' }, { path: 'organization', select: 'name' }, { path: 'courses', select: 'title' }]
        useful.findQuery(data, res, extra, 'organizationGroup', getWrapper, (docs, count, err) => {
            if (err) {
                security.sendSomethingWrong(res)
            } else {
                // console.log(docs)
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}


// function postOrganizationGroup(data, res, extra) {
//     let populates = [{ path: 'owner', select: 'fullname name phone' }, { path: 'courses', select: 'title' }, { path: 'organization', select: 'name' }]
//     let object = {
//         name: data.name,
//         owner: data.owner,
//         organization: data.organization,
//         users: data.users,
//         courses: data.courses,
//         removed: false,
//         contractDate: new Date(),
//         cDate: new Date(),
//         uDate: new Date()
//     }




//     useful.postQuery(data, res, extra, "organizationGroup", object, populates, (queryResult, err) => {


//         if (!err) {
//             security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
//         }
//     })

// }
function postOrganizationGroup(data, res, extra) {
    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        let slug = useful.convertToSlug(data.name)
        data.slug = slug
        organizationGroupModel.create({
            name: data.name,
            slug: data.slug,
            owner: data.owner,
            organization: data.organization,
            users: data.users,
            courses: data.courses,
            contractDate: new Date(),
            uDate: new Date(),
            removed: false,
            cDate: new Date(),
        }).then((org) => {
            organizationGroupModel.findOne({ _id: org._id }).populate('courses').populate('organization').populate('owner', 'fullname').lean().then((result) => {

                let promisses = []
                for (let i = 0; i < result.users.length; i++) {
                    const user = result.users[i];
                    promisses.push(new Promise((resolve, reject) => {

                        users.findOne({ phone: user.phone }).lean().select({ password: 0 }).then((orguser) => {
                            let userCoursePromisses = []
                            if (orguser) {
                                // console.log('uuuusssseeeeerrrrr', orguser);
                                for (let j = 0; j < result.courses.length; j++) {
                                    const course = result.courses[j];
                                    userCoursePromisses.push(new Promise((lresolve, reject) => {
                                        userCourseModel.findOne({ course: course._id, user: orguser._id, removed: false }).lean().then((orgusercourse) => {
                                            if (!orgusercourse) {
                                                userCourseModel.create({
                                                    course: course._id,
                                                    user: orguser._id,

                                                    cDate: new Date(),
                                                    uDate: new Date(),
                                                    removed: false
                                                }).then((usercourse) => {
                                                    console.log('tp', usercourse);
                                                    let obj = {
                                                        user:orguser._id,
                                                        course:course._id
                                                    }
                                                    addToGroup(obj,()=>{

                                                        lresolve()
                                                    })
                                                })
                                            }
                                            lresolve()
                                        })

                                    }))
                                }
                            }
                            Promise.all(userCoursePromisses).then(() => {
                                resolve()
                            })
                        })
                    }))
                }
                Promise.all(promisses).then(() => {
                    learningPathModel.create({
                        organizationGroup: result._id,
                        course: data.courses,
                        uDate: new Date(),
                        removed: false,
                        cDate: new Date(),
                    }).then((learningPath) => {
                        result.learningPath = learningPath
                        console.log('0000000000', result);
                        security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
                    })
                }).catch(() => { security.sendSomethingWrong(res) })
            })
        })
    } else {
        let slug = useful.convertToSlug(data.slug)
        data.slug = slug

        organizationGroupModel.findOneAndUpdate({ _id: data._id }, {
            name: data.name,
            slug: data.slug,

            owner: data.owner,
            organization: data.organization,
            users: data.users,
            courses: data.courses,
            contractDate: new Date(),
            uDate: new Date(),
        }, { new: true }).then((result) => {
            let promisses = []
            for (let i = 0; i < result.users.length; i++) {
                const user = result.users[i];
                promisses.push(new Promise((resolve, reject) => {

                    users.findOne({ phone: user.phone }).lean().select({ password: 0 }).then((orguser) => {
                        let userCoursePromisses = []
                        if (orguser) {
                            // console.log('uuuusssseeeeerrrrr', orguser);
                            for (let j = 0; j < result.courses.length; j++) {
                                const course = result.courses[j];
                                userCoursePromisses.push(new Promise((lresolve, reject) => {
                                    userCourseModel.findOne({ course: course._id, user: orguser._id, removed: false }).lean().then((orgusercourse) => {
                                        if (!orgusercourse) {
                                            userCourseModel.create({
                                                course: course._id,
                                                user: orguser._id,

                                                cDate: new Date(),
                                                uDate: new Date(),
                                                removed: false
                                            }).then((usercourse) => {
                                                console.log('tp', usercourse);
                                                let obj = {
                                                    user:orguser._id,
                                                    course:course._id
                                                }
                                                addToGroup(obj,()=>{

                                                    lresolve()
                                                })
                                            })
                                        }
                                        lresolve()
                                    })

                                }))
                            }
                        }
                        Promise.all(userCoursePromisses).then(() => {
                            resolve()
                        })
                    })
                }))
            }
            Promise.all(promisses).then(() => {

            learningPathModel.findOneAndUpdate({ organizationGroup: result._id }, {
                course: data.courses,
                uDate: new Date(),
            }, { new: true }).then((learningPath) => {
                
                result.learningPath = learningPath
                security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
            })
            })
        }).catch(() => { security.sendSomethingWrong(res) })
    }
}


function removeOrganizationGroup(data, res, extra) {
    // useful.removeQuery(data, res, extra, "mail", () => { })
    organizationGroupModel.findOneAndUpdate({ _id: data.id }, { removed: true }, { new: true }).then((organizationGroup) => {
        if (organizationGroup) {
            security.sendResponse(res, { info: organizationGroup }, 200, 'simpleJson')
        } else {
            security.sendNotFound(res)
        }

    })
}

function getOneOrganizationGroup(data, res, extra) {
    let filter = data
    filter.removed = false

    organizationGroupModel.findOne(filter).populate('courses').populate('organization').lean().then((organizationGroup) => {
        if (organizationGroup) {
            learningPathModel.findOne({ organizationGroup: organizationGroup._id }).populate('course').populate('organizationGroup').lean().then((learningPath) => {
                organizationGroup.learningPath = learningPath
                security.sendResponse(res, { info: organizationGroup }, 200, 'simpleJson')
            })
        } else {
            security.sendNotFound(res)
        }
    })
}
function getOrgUserLearningPath(data, res, extra) {
    console.log('----------', extra.session.user);
    console.log('object', data);
    let filter = data
    filter.removed = false
    coursePromisses = []
    organizationGroupModel.findOne(filter).populate('courses').populate('organization').lean().then((organizationGroup) => {
        if (organizationGroup) {
            learningPathModel.findOne({ organizationGroup: organizationGroup._id }).populate('course').populate('organizationGroup').lean().then((learningPath) => {
                console.log('learningPath', learningPath);
                organizationGroup.learningPath = learningPath
                for (let j = 0; j < learningPath.course.length; j++) {
                    const course = learningPath.course[j];
                    coursePromisses.push(new Promise((lresolve, reject) => {
                        userCourseModel.findOne({ user: extra.session.user, course: course._id }).lean().then((userCourse) => {
                            if(userCourse && userCourse.score){

                                course.finalScore = userCourse.score
                                lresolve()
                            }else{
                                course.finalScore = 0
                                lresolve() 
                            }
                        })
                    }))

                }

                Promise.all(coursePromisses).then(() => {
                    console.log('objecttttttt', organizationGroup);

                    security.sendResponse(res, { info: organizationGroup }, 200, 'simpleJson')

                })

            })
        } else {
            security.sendNotFound(res)
        }
    })
}







function getMyOrganizationUserscourseInfo(data, res, extra) {
    console.log('object', data);
    let filter = data
    filter.removed = false
    let notSignedupUSer = []
    let promisses = []
    organizationGroupModel.findOne({ _id: data.org, removed: false }).populate('courses').populate('organization').lean().then((organizationGroup) => {
        if (organizationGroup) {

            let organizationUsers = []
            for (let i = 0; i < organizationGroup.users.length; i++) {
                const user = organizationGroup.users[i];
                promisses.push(new Promise((resolve, reject) => {
                    users.findOne({ phone: user.phone, removed: false }).lean().select({ password: 0 }).then((orgUser) => {
                        if (orgUser) {
                            userCourseModel.findOne({ user: orgUser._id, course: data.course, removed: false }).lean().then((userCourse) => {
                                if (userCourse) {

                                    orgUser.userCourse = userCourse
                                }
                            }).then(() => {
                                // console.log('-----------',user);
                                organizationUsers.push(orgUser)
                                console.log('----------orrrrrrr-', organizationUsers);

                                resolve()
                            })
                        } else {
                            notSignedupUSer.push(user)
                            resolve()
                        }

                    })
                }))
            }

            Promise.all(promisses).then(() => {
                console.log('------------------------', organizationUsers);
                organizationGroup.organizationUsers = organizationUsers
                organizationGroup.notSignedupUSer = notSignedupUSer
                console.log('------------------------', organizationGroup);
                security.sendResponse(res, { info: organizationGroup }, 200, 'simpleJson')
            })

        } else {
            security.sendNotFound(res)
        }
    })
}
function getMyOrganizationUsersInfo(data, res, extra) {
    console.log('object', data);
    let filter = data
    filter.removed = false
    let notSignedupUSer = []
    console.log('----------', filter);
    let promisses = []
    organizationGroupModel.findOne(filter).populate('courses').populate('organization').lean().then((organizationGroup) => {
        if (organizationGroup) {
            learningPathModel.findOne({ organizationGroup: organizationGroup._id }).populate('course').populate('organizationGroup').lean().then((learningPath) => {
                organizationGroup.learningPath = learningPath
                let organizationUsers = []
                for (let i = 0; i < organizationGroup.users.length; i++) {
                    const user = organizationGroup.users[i];
                    promisses.push(new Promise((resolve, reject) => {
                        users.findOne({ phone: user.phone, removed: false }).lean().select({ password: 0 }).then((orgUser) => {
                            if (orgUser) {

                                let userCourses = []
                                let passedUserCourses = []
                                let coursePromisses = []
                                for (let j = 0; j < organizationGroup.courses.length; j++) {
                                    const course = organizationGroup.courses[j];
                                    coursePromisses.push(new Promise((lresolve, reject) => {
                                        userCourseModel.findOne({ user: orgUser._id, course: course._id }).lean().then((userCourse) => {
                                            if (userCourse && userCourse.score >= 10) {

                                                passedUserCourses.push(userCourse)
                                            }
                                            userCourses.push(userCourse)
                                            lresolve()
                                        })
                                    }))

                                }
                                Promise.all(coursePromisses).then(() => {
                                    orgUser.passedUserCourses = passedUserCourses
                                    orgUser.userCourses = userCourses
                                    // console.log('-----------',user);
                                    organizationUsers.push(orgUser)
                                    console.log('----------orrrrrrr-', organizationUsers);

                                    resolve()
                                })
                            } else {
                                notSignedupUSer.push(user)
                                resolve()
                            }

                        })
                    }))
                }

                Promise.all(promisses).then(() => {
                    organizationGroup.organizationUsers = organizationUsers
                    organizationGroup.notSignedupUSer = notSignedupUSer
                    security.sendResponse(res, { info: organizationGroup }, 200, 'simpleJson')
                })
            })
        } else {
            security.sendNotFound(res)
        }
    })
}

function getMyOrganizationInfo(data, res, extra) {
    // console.log('tp1', extra.session.user)
    let orgOwner = []
    let orgUser = []
    users.findOne({ _id: extra.session.user, removed: false }).then((usergroup) => {

        // console.log('tp2', usergroup)
        organizationGroupModel.find({ removed: false }).populate('courses').populate('organization').populate('owner', 'fullname name phone').then((organizationGroup) => {
            // console.log('tp3', organizationGroup)
            if (organizationGroup) {
                for (let x = 0; x < organizationGroup.length; x++) {
                    const og = organizationGroup[x];
                    let ownerTrue = false
                    let userTrue = false
                    for (let i = 0; i < og.owner.length; i++) {
                        const element = og.owner[i];
                        if (element._id == extra.session.user) {
                            ownerTrue = true
                        }

                    }
                    if (ownerTrue == true) {
                        orgOwner.push(og)
                    }
                    for (let i = 0; i < og.users.length; i++) {
                        const element = og.users[i];
                        if (element.phone == usergroup?.phone) {
                            userTrue = true
                        }

                    }
                    if (userTrue == true) {
                        orgUser.push(og)
                    }
                }
                // console.log('tp4', orgOwner, orgUser)
                security.sendResponse(res, { info: { orgOwner: orgOwner, orgUser: orgUser } }, 200, 'simpleJson')
            }
        })

    }).catch((err) => {
        security.sendNotFound(err)
    })
}
// function getMyOrganizationInfo(data, res, extra) {
//     console.log('tp1', extra.session.user)
//     users.findOne({ _id: extra.session.user, removed: false }).then((usergroup) => {
//         let userfilter = {}
//         userfilter.removed= false
//         userfilter = { $or: [{ 'owner': extra.session.user }, { 'users.phone':  usergroup?.phone  }] }


//         console.log('tp3', userfilter)

//         organizationGroupModel.find({ userfilter }).populate('courses').then((organizationGroups) => {

//                 // console.log('tp4', orgOwner, orgUser)
//                 security.sendResponse(res, { info: organizationGroups}, 200, 'simpleJson')


//     }).catch((err) => {
//         console.log('----------errrrrrrrr---',err);

//         security.sendNotFound(err)
//     })
//     }).catch((err) => {
//         console.log('-------------',err);
//         security.sendNotFound(err)
//     })
// }

// async function userLogin(data, res, extra) {

//     // console.log(data[INDICATORTYPE])
//     // console.log(data.password)

//     useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "users", async (exist, userErr) => {
//         if (userErr) {
//             security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra);
//             return;
//         }
//         if (!exist) {
//             security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists" }, 401, extra);
//             return;
//         }
//         // if (data[INDICATORTYPE].length >= 11 && data.password.length >= 8) {
//         let check = {
//             [INDICATORTYPE]: data[INDICATORTYPE],
//             removed: false
//         };

//         users.findOne(check).then(user => {
//             organizationGroupModel.find({ users: user.phone, removed: false }).then((orgroup) => {


//                 // let users = orgroup;

//                 // for (let i = 0; i <= users.length; i++) {
//                 //     if (user.phone == users[i].phone) {
//                 // console.log("check", data.password)
//                 // console.log("pass", user)
//                 if (check && userUtils.compareHash(data.password, user.password)) {
//                     // relationsModel.find({ user: extra.session.user, removed: false }).lean().then((relations) => {
//                     //     if (relations) {
//                     //         user.relations = relations
//                     useful.loginProcess(user, res, extra);
//                     // } else {
//                     //     useful.loginProcess(user, res, extra);
//                     // }
//                     // })
//                 } else {
//                     security.sendResponse(res, { code: "#130", message: "{{lang}}errors.userOrPasswordWrong" }, 401, extra);
//                 }
//                 //     }
//                 // }
//             })





//         })
//             .catch((err) => {
//                 console.log(err)
//                 security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra);
//             });
//         // } else {
//         //     security.sendResponse(res, { code: "#130", message: "{{lang}}errors.userOrPasswordWrong" }, 401, extra);
//         // }
//     });
// }

// function getUserGroup(data, res, extra) {


//     let users = data.users;

//     for (let i = 0; i <= users.length; i++) {

//     }


// }

module.exports = myApiSwitcher