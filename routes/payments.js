// const valueModel = require('../models/valueModel');
const useful = require('../utils/useful')
const security = require('../security');
const userModel = require('../models/userModel');
const { getUserPrivateData } = require('../utils/user.utils');
const paymentModel = require('../models/paymentModel');
const userCourseModel = require('../models/userCourseModel');
const learningPathModel = require('../models/learningPathModel');
const connectionModel = require('../models/connectionModel');
const billingModel = require('../models/billingModel');
const courseModel = require('../models/courseModel')

const zarinpalCheckout = require('zarinpal-checkout');
const { learningPath } = require('../routes');
const { addToGroup } = require('./messenger');

const zarinToken = "d477cd31-ea58-4d9c-8504-df72fe3169ce" // Zabunzad.ir
const callbackURL = "https://yaadin.com/verify?id="
const zarinpal = zarinpalCheckout.create(zarinToken, false)


let apisList = {


    'payments/requestIncreaseBalance': { function: requestIncreaseBalance, security: ["token"], response: { type: 'json' } }, // REMOVE
    'payments/verifyIncrease': { function: verifyIncrease, security: null, response: { type: 'json' } }, // REMOVE

    // 'payments/increaseBalance': { function: increaseBalance, security: ["token"], response: { type: 'json' } }, // REMOVE

    'payments/getPayments': { function: getPayments, security: ['token', { type: 'roles', access: ['superadmin'] }], response: { type: 'json' } }, // REMOVE
    'payments/updatePayment': { function: updatePayment, security: ["token"], response: { type: 'json' } }, // REMOVE
    'payments/removePayment': { function: removePayment, security: ["token"], response: { type: 'json' } }, // REMOVE
    'payments/ignoreData': { function: ignoreData, security: ["token"], response: { type: 'json' } }, // REMOVE

    'payments/getMyPayments': { function: getMyPayments, security: ['token'], response: { type: 'json' } }, // REMOVE


}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions


async function ignoreData(data, res, extra) {
    // userModel.updateOne()
    userModel.findOneAndUpdate({ _id: extra.session.user }, { balance: 0 }, { new: true }).then((user) => {

        let now = new Date()
        connectionModel.updateMany({ user: extra.session.user, tTarget: { $ne: null }, removed: false }, { cDate: now, uDate: now }).then((connections) => {
            console.log(connections)
            billingModel.updateMany({ user: extra.session.user, status: -1 }, { status: -2 }).then(() => {

                security.sendResponse(res, { user: user }, 200, 'simpleJson')

            })
        })

    })
}



async function removePayment(data, res, extra) {

    paymentModel.updateOne({ _id: data.id }, {
        removed: true
    }).then((doc) => {
        security.sendResponse(res, { info: doc }, 200, 'simpleJson')
    }).catch(() => {
        security.sendSomethingWrong(res)
    })
}

async function updatePayment(data, res, extra) {

    paymentModel.findOneAndUpdate({ _id: data._id }, {
        amount: data.amount,
    }, { new: true }).select('amount user cDate').populate('user').then((doc) => {
        security.sendResponse(res, { info: doc }, 200, 'simpleJson')
    }).catch(() => {
        security.sendSomethingWrong(res)
    })
}




async function getMyPayments(data, res, extra) {

    let filter = data.filter ? useful.filterCreator(data.filter) : {}
    let sort = data.sort ? data.sort : { cDate: -1 }
    let limit = data.limit ? data.limit : null
    let skip = data.skip ? data.limit * data.skip : null
    filter.removed = false
    filter.user = extra.session.user
    filter.status = "2"



    paymentModel.find(filter).select('user amount cDate').populate('user', 'name family fullname username wallet').lean().sort(sort).limit(limit).skip(skip).then((docs) => {

        if (data.getCount) {
            paymentModel.find(filter).count().then((count) => {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            })
        } else {
            security.sendResponse(res, { info: docs }, 200, 'simpleJson')
        }

    }).catch(() => {
        security.sendSomethingWrong(res)
    })

}



async function getPayments(data, res, extra) {

    let filter = data.filter ? useful.filterCreator(data.filter) : {}
    let sort = data.sort ? data.sort : { cDate: -1 }
    let limit = data.limit ? data.limit : null
    let skip = data.skip ? data.limit * data.skip : null
    filter.removed = false

    filter.status = { $ne: '0' }

    paymentModel.find(filter).select('user amount cDate').populate('user', 'name family fullname username wallet').lean().sort(sort).limit(limit).skip(skip).then((docs) => {

        if (data.getCount) {
            paymentModel.find(filter).count().then((count) => {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            })
        } else {
            security.sendResponse(res, { info: docs }, 200, 'simpleJson')
        }

    }).catch(() => {
        security.sendSomethingWrong(res)
    })

}



async function requestIncreaseBalance(data, res, extra) {

    console.log("requestIncreaseBalance");
    console.log(data)
    console.log(data.course)
    let filter = data
    filter.user = extra.session.user
    
    // ordersModel.findOne(filter).populate('list.product', 'title images description ').populate('categories', 'values.title values.slug').populate('brand', 'values.name').populate('usecases', 'values.title').lean().then((doc) => {
        //     if (doc) {
            // console.log(callbackURL )
            userModel.findOne({_id : extra.session.user} ).lean().then((user) => {
        console.log('user',user)

        // let coinAmount = data.amount
        if (data.course) {
            let teachercommission = 0
            courseModel.findOne({ _id: data.course }).populate('teacher', 'name family fullname image email description rating commission  credit').lean().then((course) => {
                if (course) {
                    if (user.wallet >= course.price) {
                        teachercommission = (course.price * ((course.teacher.commission ?? 0) / 100))
                        let promises = []

                        promises.push(new Promise((resolve, reject) => {
                            paymentModel.create({
                                user: extra.session.user,
                                uDate: new Date(),
                                cDate: new Date(),
                                amount: course.price,
                                teachercommission: teachercommission,
                                list: [data.course],
                                status: '2',
                                method: 'wallet',
                                removed: false
                            }).then(() => {

                                console.log("UPDATED")

                                userModel.updateOne({ user: extra.session.user }, {
                                    $inc: { wallet: ((course.price) * -1) }
                                }).then((result) => {
                                    resolve()
                                }).catch((err) => {
                                    console.log(err)
                                    reject()

                                    // security.sendSomethingWrong(res) 
                                })
                            })
                        }))

                        afterBuyAction(data.course, extra.session.user, () => {

                            Promise.all(promises).then(() => {

                                security.sendResponse(res, { success: true, type: 'added', method: 'wallet' }, 200, 'simpleJson')


                            }).catch(err => {
                                security.sendSomethingWrong(res)

                            })

                        })

                    } else {

                        createPaymentLink(data.amount, res, data, extra, () => { })

                        //// CHANGE
                        // security.sendResponse(res, { message: '{lang}error.insufficientAmount' }, 403, 'simpleJson')

                    }
                } else {
                    security.sendNotFound()
                }
            })
        }
        else {
            if (data.amount) {

                createPaymentLink(data.amount, res, data, extra, () => { })

            } else {

                security.sendResponse(res, { message: '{lang}error.insufficientAmount' }, 403, 'simpleJson')

            }
        }
    })
}



function createPaymentLink(amount, res, data, extra, cb) {

    let list = []



    if (data.course) {
        list = list.push(data.course)
    }

    console.log(data)
    console.log(data.course)

    paymentModel.create({ user: extra.session.user, cDate: new Date(), uDate: new Date(), amount: amount, status: '0', method: 'onlinePayment', list, removed: false }).then((payment) => {

        zarinpal.PaymentRequest({
            Amount: data.amount, // in tomans
            CallbackURL: callbackURL + payment._id,
            Description: "افزایش حساب کیف پول - yadin",
            Email: 'info@yadin.com',
            Mobile: ''
        }).then(resp => {
            console.log(resp)
            if (resp.status == 100) {
                paymentModel.updateOne({ _id: payment._id }, {
                    $push: { authority: resp.authority }
                }).then(() => {

                    security.sendResponse(res, { info: resp.url }, 200, 'simpleJson')

                })

            } else {
                // cb(null, "Something went wrong with Zarinpal")
                security.sendSomethingWrong(res)

            }
        }).catch(err => {
            security.sendSomethingWrong(res)


        })


    }).catch((err) => {
        security.sendSomethingWrong(res)

        console.log('err', err)
    })
}


function afterBuyAction(courseId, user, cb) {

    let promises = []

    promises.push(new Promise((resolve, reject) => {

        userCourseModel.create({
            course: courseId,
            user: user
        }).then(() => {
            let data = {
                course: courseId,
                user: user
            }
            addToGroup(data, () => {
                resolve()
            })
        }).catch((err) => {
            console.log(err)
            reject()
        })
    }))

    // promises.push(new Promise((resolve, reject) => {
    //     learningPathModel.updateOne({ user: user }, {

    //         $push: { course: courseId }

    //     }).then(() => {
    //         resolve()
    //     }).catch((err) => {
    //         console.log(err)
    //         reject()
    //     })

    // }))
    promises.push(new Promise((resolve, reject) => {
        courseModel.findOne({ _id: courseId }).lean().then((course) => {
            userModel.findOne({ _id: course.teacher }).lean().then((teacher) => {

                let commission = teacher.commission ?? 0
                userModel.updateOne({ user: teacher._id }, {

                    $inc: { credit: ((course.price) * (commission / 100)) }

                }).catch((err) => { reject() })

            }).then(() => {
                resolve()
            }).catch((err) => { reject() })
        }).catch((err) => { reject() })

    }))

    Promise.all(promises).then(() => {
        cb()
    })


}


async function verifyIncrease(data, res, extra) {


    // if (data.amount) {
    // userModel.findOne({ _id: extra.session.user }).then((user) => {
    //     if (data.amount >= -1 * user.balance) {

    paymentModel.findOne({ _id: data.id, authority: data.authority, removed: false }).then((payment) => {

        // console.log("FOUND")
        if (payment != null) {

            if (payment.status == '2') {

                // res.send({ status: 200, list: payment.list, refId: payment.refId })
                security.sendResponse(res, { info: payment, refId: payment.refId, type: 'exist' }, 200, 'simpleJson')


            } else {

                let refId

                zarinpal.PaymentVerification({
                    Amount: payment.amount,
                    Authority: data.authority,
                }).then(async resp => {
                    if (resp.status != 100 && resp.status != 101) {

                        security.sendResponse(res, { code: '#403', message: err }, 403, 'simpleJson')

                    } else {
                        // console.log("resp")
                        // console.log(resp)

                        refId = resp.RefID

                        let promises = []

                        promises.push(new Promise((resolve, reject) => {
                            paymentModel.findOneAndUpdate({ _id: data.id, authority: data.authority }, {
                                uDate: new Date(),
                                pDate: new Date(),
                                status: '2',
                                refId: resp.RefID
                            }).then(() => {

                                console.log("UPDATED")
                                console.log(payment.amount)
                                console.log(payment.user)

                                userModel.updateOne({ _id: payment.user }, {
                                    $inc: { wallet: payment.amount }
                                }).then((result) => {
                                    console.log("Update Res")
                                    console.log(result)
                                    resolve()
                                }).catch((err) => {
                                    console.log(err)
                                    reject()

                                    // security.sendSomethingWrong(res) 
                                })
                            }).catch(err => {
                                console.log(err)

                                // res.send({ status: 500, code: '103', message: err.message })
                                reject()
                            })
                        }))

                        let approvedList

                        if (payment.list && payment.list.length > 0) {
                            console.log("TP1")
                            promises.push(new Promise((resolve, reject) => {
                                userModel.findOne({ _id: payment.user }).lean().then((user) => {
                                    let teachercommission = 0
                                    courseModel.findOne({ _id: data.course }).populate('teacher', 'name family fullname image email description rating commission  credit').lean().then((course) => {
                                        if (user.wallet >= course.price) {
                                            teachercommission = (course.price * ((course.teacher.commission ?? 0) / 100))

                                            userModel.updateOne({ _id: user._id }, {
                                                $inc: { wallet: ((course.price) * -1) }
                                            }).then((result) => {
                                                paymentModel.findOneAndUpdate({ _id: data.id, authority: data.authority }, {
                                                    teachercommission: teachercommission
                                                }).then(() => {

                                                    afterBuyAction(payment.list[0], payment.user, () => {

                                                        approvedList = payment.list
                                                        resolve()

                                                    })
                                                })
                                            }).catch((err) => {
                                                console.log(err)
                                                reject()

                                                // security.sendSomethingWrong(res) 
                                            })
                                        }
                                    })
                                })


                            }))

                        }

                        Promise.all(promises).then(() => {

                            if (approvedList) {

                                courseModel.findOne({ _id: approvedList[0] }).populate('teacher', 'name family fullname').then((courseInfo) => {

                                    security.sendResponse(res, { success: true, type: 'added', method: 'wallet', refId: refId, approvedList, courseInfo }, 200, 'simpleJson')

                                })

                            } else {

                                console.log(refId)
                                security.sendResponse(res, { success: true, type: 'added', method: 'wallet', refId: refId }, 200, 'simpleJson')

                            }



                        }).catch(err => {
                            security.sendSomethingWrong(res)

                        })
                    }
                })


            }
        }

    }).catch(() => { security.sendSomethingWrong(res) })

    // } 
    // else {
    //     security.sendResponse(res, { message: "{{lang}}errors.insufficientAmount" }, 401, 'simpleJson')
    // }
    // }).catch(() => { security.sendSomethingWrong(res) })

    // } else {
    //     security.sendSomethingWrong(res)
    // }
}




// async function increaseBalance(data, res, extra) {


//     if (data.amount) {
//         userModel.findOne({ _id: extra.session.user }).then((user) => {
//             if (data.amount >= -1 * user.balance) {

//                 paymentModel.create({ user: user._id, cDate: new Date(), amount: data.amount, removed: false }).then(() => {

//                     userModel.findOneAndUpdate({ _id: extra.session.user }, {
//                         $inc: { balance: data.amount }
//                     }, { new: true }).then((result) => {

//                         security.sendResponse(res, { done: true, user: getUserPrivateData(result) }, 200, 'simpleJson')
//                     }).catch(() => { security.sendSomethingWrong(res) })

//                 }).catch(() => { security.sendSomethingWrong(res) })

//             } else {
//                 security.sendResponse(res, { message: "{{lang}}errors.insufficientAmount" }, 401, 'simpleJson')
//             }
//         }).catch(() => { security.sendSomethingWrong(res) })

//     } else {
//         security.sendSomethingWrong(res)
//     }
// }




module.exports = myApiSwitcher