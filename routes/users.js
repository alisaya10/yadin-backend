//? password
const crypto = require("crypto");
const moment = require("jalali-moment")

//? models
const users = require("../models/userModel");
const partnerModel = require('../models/partnerModel');
const tempUserModel = require("../models/tempUserModel")
const connectionModel = require("../models/connectionModel")

//? useful
const useful = require("../utils/useful");
const userUtils = require("../utils/user.utils");

//? genrate code
const activationCode = require('../utils/activationCode')

//? security
const security = require("../security");

//? variabels
const { publisher } = require("../variables");
const organizationGroupModel = require("../models/organizationGroupModel");
const userCourseModel = require("../models/userCourseModel");
const { addToGroup } = require("./messenger");

const VALIDLASTCODETRY = 10 //minutes
const INDICATORTYPE = "phone"
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
    //! user exist check
    "users/check": { function: userCheck, security: null, response: { type: "json" } },

    //! user login 
    "users/authenticate": { function: userLogin, security: null, response: { type: "json" } },

    //! user send code
    "users/signup/verifyCode": { function: verifyCode, security: null, response: { type: "json" } },

    //! user post info  // create user
    "users/signup/postInfo": { function: userPostInfo, security: null, response: { type: "json" } },

    //! user forget password
    "users/forgotPassword": { function: userForgotPassword, security: null, response: { type: "json" } },

    //! user forget password verify code 
    "users/forgotPassword/verifyCode": { function: userForgetPasswordVerifyCode, security: null, response: { type: "json" } },

    //! user forget password post password
    "users/forgotPassword/postPassword": { function: userForgotPasswordPostPassword, security: null, response: { type: "json" } },

    //! update user
    "users/add": { function: userUpdate, security: ['token'], response: { type: "json" } },
    //! userAddFromPanel
    "users/addFromPanel": { function: userAddFromPanel, security: ['token'], response: { type: "json" } },
    //! admin update user
    "users/updateFromPanel": { function: userUpdateAdmin, security: ['token'], response: { type: "json" } },

    //! get users
    "users/getAll": { function: getUsers, security: null, response: { type: "json" } },

    //! get teachers
    "users/getAllTeachers": { function: getAllTeachers, security: null, response: { type: "json" } },

    //! remove user
    "users/remove": { function: removeUser, security: ['token'], response: { type: "json" } },

    //! get user info
    "users/getInfo": { function: userInfoGet, security: ['token'], response: { type: "json" } },

    //! user auth with code
    "users/signin/requestCode": { function: userSigninRequestCode, security: null, response: { type: "json" } },

    //! user auth verify code
    "users/signin/verifyCode": { function: userSigninVerifyCode, security: null, response: { type: "json" } },

    //! user update info
    "users/updateInfo": { function: userUpdateInfo, security: null, response: { type: "json" } },

    //! user register device
    "users/registerDevice": { function: userRegisterDevice, security: null, response: { type: "json" } },

    //! user unregister device
    "users/unregisterDevice": { function: userUnregisterDevice, security: null, response: { type: "json" } },

    //!sterling Authorization
    "users/unregisterDevice": { function: userUnregisterDevice, security: null, response: { type: "json" } },
    //!getInbox
    "users/getInbox": { function: getInbox, security: null, response: { type: "json" } },

    //!seenInbox
    "users/seenInbox": { function: seenInbox, security: null, response: { type: "json" } },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList);
}
//* myApiSwitcher

//? date
var date = new Date();
//? date
//! add user(teacher) from pannel

async function userAddFromPanel(data, res, extra) {
    let date = new Date();

    console.log("data", data)



    if (data._id) {

        useful.checkUserExist("phone", data.phone, "users", async (exist, userErr) => {


            if (exist) {
                // console.log('-------------------------------------here1');
                users.findOne({ phone: data.phone, active: 1 }).lean().select({ password: 0 }).then((employee) => {
                    // console.log('-------------------------------------here1erf', employee);

                    if (data._id == employee._id) {
                        // console.log('-------------------------------------here3');


                        let object = {
                            firstName: data.firstName,
                            name: data.name,
                            lastName: data.lastName,
                            fullname: !(data.firstName && data.lastName) ? data.fullname : `${data.firstName} ${data.lastName}`,
                            username: data.username,
                            wallet: data.wallet,
                            commission: data.commission,
                            cover: data.cover,
                            image: data.image,
                            description: data.description,
                            phone: data.phone,
                            email: data.email,
                            type: data.type,
                            credit: data.credit,
                            status: 'teachers',
                            document: data.document,
                            [INDICATORTYPE]: data[INDICATORTYPE],
                            contactInfo: data?.contactInfo,
                            location: data.location,
                            mall: data?.mall,
                            brand: data.brand,
                            gender: data.gender,
                            bodyStyle: data.bodyStyle,
                            birthday: data.birthday,
                            weight: data.weight,
                            height: data.height,
                            active: data.active,
                            removed: false,
                            uDate: new Date(),
                            removed: false
                        }

                        if (data.password) {
                            let hash = crypto.scryptSync(data.password, "salt", 64).toString('hex');
                            object.password = hash
                        }

                        if (data.password && data.password.length >= 8) {
                            // console.log('tp1---------------------------------');
                            users.findOneAndUpdate({ phone: data.phone }, object, { new: true }).lean().select({ password: 0 }).then((employee) => {
                                console.log(employee)
                                security.sendResponse(res, { code: "#132", status: 200, update: true, info: employee }, 200, 'simpleJson')
                            }).catch(() => {
                                security.sendResponse(res, { code: "#134", status: 500, update: false }, 500, 'simpleJson')
                            })
                        } else if (data["password"] == undefined || data.password == null || !data.password) {
                            // console.log('tp2--------------------------------------');
                            users.findOne({ phone: data.phone, active: 1 }).then((employee) => {
                                console.log(employee)
                                users.findOneAndUpdate(
                                    { phone: data.phone, active: 1 },
                                    {
                                        firstName: data.firstName,
                                        name: data.name,
                                        lastName: data.lastName,
                                        fullname: !(data.firstName && data.lastName) ? data.fullname : `${data.firstName} ${data.lastName}`,
                                        username: data.username,
                                        wallet: data.wallet,
                                        commission: data.commission,
                                        cover: data.cover,
                                        image: data.image,
                                        description: data.description,
                                        phone: data.phone,
                                        email: data.email,
                                        type: data.type,
                                        credit: data.credit,
                                        status: 'teachers',
                                        document: data.document,
                                        [INDICATORTYPE]: data[INDICATORTYPE],
                                        contactInfo: data?.contactInfo,
                                        location: data.location,
                                        mall: data?.mall,
                                        brand: data.brand,
                                        gender: data.gender,
                                        bodyStyle: data.bodyStyle,
                                        birthday: data.birthday,
                                        weight: data.weight,
                                        height: data.height,
                                        active: data.active,
                                        password: employee.password,
                                        removed: false,
                                        uDate: new Date(),
                                        removed: false
                                    },
                                    {
                                        new: true
                                    }
                                ).lean().select({ password: 0 }).then((employee) => {
                                    security.sendResponse(res, { code: "#132", update: true, info: employee }, 200, 'simpleJson')
                                })
                            })
                        } else if (data.password && data.password.length < 8) {
                            // console.log('tp3-------------------------------------------');
                            security.sendResponse(res, { code: "#132", update: false, info: employee, message: 'password must be at least 8 characters' }, 400, 'simpleJson')

                        }
                    } else {
                        security.sendResponse(res, { code: "#132", update: false, info: employee, message: 'phone number exists' }, 400, 'simpleJson')
                    }
                })
            }

            if (!exist) {
                // console.log('-------------------------------------here2');

                // console.log('tp2')


                // console.log(data.password)

                let object = {
                    firstName: data.firstName,
                    name: data.name,
                    lastName: data.lastName,
                    fullname: !(data.firstName && data.lastName) ? data.fullname : `${data.firstName} ${data.lastName}`,
                    username: data.username,
                    wallet: data.wallet,
                    commission: data.commission,
                    cover: data.cover,
                    image: data.image,
                    description: data.description,
                    phone: data.phone,
                    email: data.email,
                    type: data.type,
                    credit: data.credit,
                    status: 'teachers',
                    document: data.document,
                    [INDICATORTYPE]: data[INDICATORTYPE],
                    contactInfo: data?.contactInfo,
                    location: data.location,
                    mall: data?.mall,
                    brand: data.brand,
                    gender: data.gender,
                    bodyStyle: data.bodyStyle,
                    birthday: data.birthday,
                    weight: data.weight,
                    height: data.height,
                    active: data.active,
                    removed: false,
                    uDate: new Date(),
                    removed: false
                }

                if (data.password) {
                    let hash = crypto.scryptSync(data.password, "salt", 64).toString('hex');
                    object.password = hash
                }

                if (data.password && data.password.length >= 8) {
                    // console.log('tp1---------------------------------');
                    users.findOneAndUpdate({ _id: data._id }, object, { new: true }).lean().select({ password: 0 }).then((employee) => {
                        console.log(employee)
                        security.sendResponse(res, { code: "#132", status: 200, update: true, info: employee }, 200, 'simpleJson')
                    }).catch(() => {
                        security.sendResponse(res, { code: "#134", status: 500, update: false }, 500, 'simpleJson')
                    })
                } else if (data["password"] == undefined || data.password == null || !data.password) {
                    // console.log('tp2--------------------------------------');
                    users.findOne({ _id: data._id, active: 1 }).then((employee) => {
                        console.log(employee)
                        users.findOneAndUpdate(
                            { _id: data._id, active: 1 },
                            {
                                firstName: data.firstName,
                                name: data.name,
                                lastName: data.lastName,
                                fullname: !(data.firstName && data.lastName) ? data.fullname : `${data.firstName} ${data.lastName}`,
                                username: data.username,
                                wallet: data.wallet,
                                commission: data.commission,
                                cover: data.cover,
                                image: data.image,
                                description: data.description,
                                phone: data.phone,
                                email: data.email,
                                type: data.type,
                                credit: data.credit,
                                status: 'teachers',
                                document: data.document,
                                [INDICATORTYPE]: data[INDICATORTYPE],
                                contactInfo: data?.contactInfo,
                                location: data.location,
                                mall: data?.mall,
                                brand: data.brand,
                                gender: data.gender,
                                bodyStyle: data.bodyStyle,
                                birthday: data.birthday,
                                weight: data.weight,
                                height: data.height,
                                active: data.active,
                                password: employee.password,
                                removed: false,
                                uDate: new Date(),
                                removed: false
                            },
                            {
                                new: true
                            }
                        ).lean().select({ password: 0 }).then((employee) => {
                            security.sendResponse(res, { code: "#132", update: true, info: employee }, 200, 'simpleJson')
                        })
                    })
                } else if (data.password && data.password.length < 8) {
                    // console.log('tp3-------------------------------------------');
                    security.sendResponse(res, { code: "#132", update: false, info: employee, message: 'password must be at least 8 characters' }, 400, 'simpleJson')

                }

            }

        })
    } else {
        useful.checkUserExist("phone", data.phone, "users", async (exist, userErr) => {
            if (exist) {
                security.sendResponse(res, { code: "#132", update: false, message: 'phone number exists' }, 400, 'simpleJson')
            }
            if (!exist) {
                if (data.password && data.password.length >= 8) {



                    let hash = crypto.scryptSync(data.password, "salt", 64).toString("hex");
                    users.create({
                        firstName: data.firstName,
                        name: data.name,
                        lastName: data.lastName,
                        fullname: !(data.firstName && data.lastName) ? data.fullname : `${data.firstName} ${data.lastName}`,
                        username: data.username,
                        wallet: data.wallet,
                        commission: data.commission,
                        cover: data.cover,
                        image: data.image,
                        description: data.description,
                        phone: data.phone,
                        email: data.email,
                        type: data.type,
                        credit: data.credit,
                        status: 'teachers',
                        document: data.document,
                        [INDICATORTYPE]: data[INDICATORTYPE],
                        contactInfo: data?.contactInfo,
                        location: data.location,
                        mall: data?.mall,
                        brand: data.brand,
                        gender: data.gender,
                        bodyStyle: data.bodyStyle,
                        birthday: data.birthday,
                        weight: data.weight,
                        height: data.height,
                        active: data.active,
                        password: hash,
                        removed: false,
                        uDate: new Date(),
                        cDate: new Date(),
                        removed: false
                    }).then((employee) => {
                        // console.log('===========',employee)
                        employee.password = ""
                        // delete employee.password
                        // console.log('=========------------==',employee)
                        security.sendResponse(res, { code: "#132", status: 200, create: true, info: employee }, 200, 'simpleJson')
                    }).catch(err => {
                        security.sendResponse(res, { code: "#134", status: 500, create: false }, 500, 'simpleJson')
                    })
                }
                else {
                    security.sendResponse(res, { code: "#131", status: 500, create: false, message: "{{lang}}errors.passwordPattern" }, 500, 'simpleJson')
                }


            }
        })
    }

}
//! add user(teacher) from pannel
// function userAddFromPanel(data, res, extra) {
//     console.log('---------------------------',data);
//     let isNew = true
//     if (data._id) {
//         isNew = false
//     }
//     if (data.password) {
//         var hash = crypto.scryptSync(data.password, "salt", 64).toString('hex');
//         data.password = hash
//     }

//     if (isNew) {

//         users.create({
//             firstName: data.firstName,
//             name: data.name,
//             lastName: data.lastName,
//             fullname: !(data.firstName && data.lastName) ? data.fullname : `${data.firstName} ${data.lastName}`,
//             username: data.username,
//             wallet: data.wallet,
//             commission: data.commission,
//             cover: data.cover,
//             image: data.image,
//             description: data.description,
//             phone: data.phone,
//             email: data.email,
//             type: data.type,
//             credit: data.credit,
//             status: 'teachers',
//             document: data.document,
//             [INDICATORTYPE]: data[INDICATORTYPE],
//             contactInfo: data?.contactInfo,
//             location: data.location,
//             mall: data?.mall,
//             brand: data.brand,
//             gender: data.gender,
//             bodyStyle: data.bodyStyle,
//             birthday: data.birthday,
//             weight: data.weight,
//             height: data.height,
//             active: data.active,
//             password: data.password,
//             removed: false,
//             uDate: new Date(),
//             cDate: new Date(),
//             removed: false
//         }).then((result) => {
//             console.log(result);
//             security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
//         }).catch(() => { security.sendSomethingWrong(res) })

//     } else {

//         users.findOneAndUpdate({ _id: data._id }, {
//             firstName: data.firstName,
//             name: data.name,
//             lastName: data.lastName,
//             fullname: !(data.firstName && data.lastName) ? data.fullname : `${data.firstName} ${data.lastName}`,
//             username: data.username,
//             wallet: data.wallet,
//             commission: data.commission,
//             cover: data.cover,
//             image: data.image,
//             description: data.description,
//             phone: data.phone,
//             email: data.email,
//             type: data.type,
//             credit: data.credit,
//             status: 'teachers',
//             document: data.document,
//             [INDICATORTYPE]: data[INDICATORTYPE],
//             contactInfo: data?.contactInfo,
//             location: data.location,
//             mall: data?.mall,
//             brand: data.brand,
//             gender: data.gender,
//             bodyStyle: data.bodyStyle,
//             birthday: data.birthday,
//             weight: data.weight,
//             height: data.height,
//             active: data.active,
//             password: data.password,
//             removed: false,
//             uDate: new Date(),
//         }, { new: true }).then((result) => {
//             security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
//         }).catch(() => { security.sendSomethingWrong(res) })
//     }
// }



//! check user exist function ###

async function userCheck(data, res, extra) {

    useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "users", async (exist, userErr) => {
        console.log('object',exist);
        if (userErr) {
            security.sendResponse(res, { code: '#101', message: '{{lang}}errors.somethingWentWrong' }, 500, extra)
            return
        }

        if (exist) {
            security.sendResponse(res, { code: "#132", exist: true }, 200, extra);
            // //! send verification code 
            // activationCode.updateActivationCode(users, INDICATORTYPE, data[INDICATORTYPE], (activationData) => {
            //     if (activationData) {
            //         activationCode.sendActivationCode(data[INDICATORTYPE], activationData.activationCode, INDICATORTYPE)
            //     }
            // })
            // return;
        }
        else {
            activationCode.updateActivationCode(tempUserModel, INDICATORTYPE, data[INDICATORTYPE], (activationData) => {
                console.log('activationData',activationData);
                if (activationData) {
                    activationCode.sendActivationCode(data[INDICATORTYPE], activationData.activationCode, INDICATORTYPE)
                }
                security.sendResponse(res, { exist: false }, 200, extra)
            })
            // security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists", exist: false }, 401, extra);
        }
    })
}

//! check user exist function ###


//! user login ###
async function userLogin(data, res, extra) {

    // console.log(data[INDICATORTYPE])
    // console.log(data.password)

    useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "users", async (exist, userErr) => {
        if (userErr) {
            security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra);
            return;
        }
        if (!exist) {
            security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists" }, 401, extra);
            return;
        }
        // if (data[INDICATORTYPE].length >= 11 && data.password.length >= 8) {
        let check = {
            [INDICATORTYPE]: data[INDICATORTYPE],
            removed: false
        };
        users.findOne(check).then(user => {
            // console.log("check", data.password)
            // console.log("pass", user)
            if (check && userUtils.compareHash(data.password, user.password)) {
                // relationsModel.find({ user: extra.session.user, removed: false }).lean().then((relations) => {
                //     if (relations) {
                //         user.relations = relations
                useful.loginProcess(user, res, extra);
                // } else {
                //     useful.loginProcess(user, res, extra);
                // }
                // })
            } else {
                security.sendResponse(res, { code: "#130", message: "{{lang}}errors.userOrPasswordWrong" }, 401, extra);
            }
        })
            .catch((err) => {
                console.log(err)
                security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra);
            });
        // } else {
        //     security.sendResponse(res, { code: "#130", message: "{{lang}}errors.userOrPasswordWrong" }, 401, extra);
        // }
    });
}
//! user login ###


//! user send code  ###

async function verifyCode(data, res, extra) {
    useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "temp-users", async (exist, userErr) => {
        if (userErr) {
            security.sendResponse(res, { code: "#128", message: '{{lang}}errors.somethingWentWrong' }, 500, extra)
            return
        }

        if (!exist || exist) {
            // console.log(data[INDICATORTYPE])
            // console.log(data.code)

            tempUserModel.findOne({
                [INDICATORTYPE]: data[INDICATORTYPE],
                activationCode: data.code,
                codeLastTry: { $gte: moment(new Date()).subtract(VALIDLASTCODETRY, 'minutes').valueOf() }
            }).then(async doc => {
                if (doc) {
                    security.sendResponse(res, { authorized: true }, 200, extra)
                } else {
                    security.sendResponse(res, { message: { code: "{{lang}}errors.codeNotValid" } }, 401, extra)

                }
            }).catch(err => {
                console.log(err)
                security.sendResponse(res, { message: "{{lang}}errors.somethingWentWrong" }, 500, extra)

            });

            // activationCode.updateActivationCode(users, INDICATORTYPE, data[INDICATORTYPE], (activationData) => {
            //     if (activationData) {
            //         activationCode.sendActivationCode(data[INDICATORTYPE], activationData.activationCode, INDICATORTYPE)
            //     }
            // })
            // security.sendResponse(res, { code: "#132", exist: true, authorized: true }, 200, extra)
            return
        } else {

            security.sendResponse(res, { message: "{{lang}}errors.userExists" }, 401, extra)

            // activationCode.updateActivationCode(tempUserModel, INDICATORTYPE, data[INDICATORTYPE], (activationData) => {
            //     if (activationData) {
            //         activationCode.sendActivationCode(data[INDICATORTYPE], activationData.activationCode, INDICATORTYPE)
            //     }
            //     security.sendResponse(res, { code: "#132", exist: false, authorized: true }, 200, extra)
            // })
        }
    })
}





// async function verifyCode(data, res, extra) {
//     tempUserModel.findOne({
//         'phone': data[INDICATORTYPE],
//         activationCode: data.code,
//         codeLastTry: { $gte: moment(new Date()).subtract(VALIDLASTCODETRY, 'minutes').valueOf() }
//     }).then(async doc => {
//         if (doc) {
//             security.sendResponse(res, { authorized: true }, 200, extra)
//         } else {
//             security.sendResponse(res, { message: { code: "{{lang}}errors.codeNotValid" } }, 401, extra)

//         }
//     }).catch(err => {
//         console.log(err)
//         security.sendResponse(res, { message: "{{lang}}errors.somethingWentWrong" }, 500, extra)

//     });


// }

//! user send code ###



//! user post info ###


async function userPostInfo(data, res, extra) {


    useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "users", (exist, userErr) => {

        console.log('hiiiiiiiiiiiiiii',data[INDICATORTYPE])
        console.log(exist);

        if (exist) {
            security.sendResponse(res, { code: "#135", message: "{{lang}}errors.userExists" }, 401, extra)
            console.log("exist", exist)
            return
        }

        let now = new Date()


        tempUserModel.findOne({
            [INDICATORTYPE]: data[INDICATORTYPE],
            'activationCode': data.code,
            'codeLastTry': { $gte: moment(now).subtract(VALIDLASTCODETRY, 'minutes') }

        }).then((user) => {
            // console.log(data.code)
            // console.log(data[INDICATORTYPE])
            console.log("user", user)

            if (user) {
                let userObject = {
                    name: data.name,
                    family: data.family,
                    fullname: !(data.name && data.family) ? data.family : `${data.name} ${data.family}`,
                    username: data.username,
                    cover: data.cover,
                    wallet: data.wallet,
                    image: data.image,
                    description: data.description,
                    phone: data.phone,
                    email: data.email,
                    type: data.type,
                    status: data?.status,
                    document: data.document,
                    [INDICATORTYPE]: data[INDICATORTYPE],
                    contactInfo: data?.contactInfo,
                    location: data.location,
                    active: data.active,
                    removed: false,
                    cDate: date,
                    uDate: date
                }


                let otherIndicators = { email: data.email, [INDICATORTYPE]: data[INDICATORTYPE], username: data.username }
                delete otherIndicators[INDICATORTYPE]
                if (true) {
                    if (data.password && data.password.length >= 8) {
                        var hash = crypto.scryptSync(data.password, "salt", 64).toString('hex');
                        otherIndicators.password = hash
                    } else {
                        security.sendResponse(res, { code: "#131", message: "{{lang}}errors.passwordPattern" }, 401, extra)
                        return
                    }
                }
                userObject = { ...userObject, ...otherIndicators }
                console.log("userObject: ", userObject)
                users.create(userObject).then((user) => {
                    organizationGroupModel.find({ 'users.phone': user.phone }).lean().then((organizationGroups) => {
                        let promisses = []
                        if (organizationGroups && organizationGroups?.length > 0) {
                            console.log('tp0', organizationGroups);
                            for (let i = 0; i < organizationGroups.length; i++) {
                                const organizationGroup = organizationGroups[i];
                                for (let j = 0; j < organizationGroup.courses.length; j++) {
                                    const course = organizationGroup.courses[j];
                                    promisses.push(new Promise((resolve, reject) => {
                                        userCourseModel.create({
                                            course: course,
                                            user: user._id,

                                            cDate: new Date(),
                                            uDate: new Date(),
                                            removed: false
                                        }).then((result) => {
                                            console.log('tp', result);
                                            let obj = {
                                                user:user._id,
                                                course:course
                                            }
                                            addToGroup(obj,()=>{
                                                resolve()
                                            })
                                        })
                                    }))


                                }

                            }
                        }
                    })

                    // publisher.publish(redisPreffix + "user.signup", JSON.stringify({ user: userUtils.getUserPrivateData(user) }), function () { });
                    if (userObject.inactive) {
                        security.sendResponse(res, { code: "#136", message: "{{lang}}errors.userIsInactive", inactive: true }, 401, extra)

                    } else {
                        console.log("login processs")
                        useful.loginProcess(user, res, extra)
                    }
                    return

                }).catch(err => {
                    console.log(err)
                    security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra)
                })

            } else {
                security.sendResponse(res, { code: "#133", message: "{{lang}}errors.wrongCredentials" }, 401, extra)

            }
        })
    })
}
//! user post info ###



//! user forgot password ###

async function userForgotPassword(data, res, extra) {

    // userCheck(data, res, extra)


    useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "users", async (exist, userErr) => {
        if (userErr) {
            security.sendResponse(res, { code: "#128", message: '{{lang}}errors.somethingWentWrong' }, 500, extra)
            return
        }

        if (exist) {
            activationCode.updateForgetPassActivationCode(users, INDICATORTYPE, data[INDICATORTYPE], (activationData) => {
                if (activationData) {
                    activationCode.sendActivationCode(data[INDICATORTYPE], activationData.activationCode, INDICATORTYPE)
                }
            })
            security.sendResponse(res, { code: "#132", exist: true }, 200, extra)
            return
        } else {
            security.sendResponse(res, { code: "#132", exist: false, authorized: true }, 200, extra)

            // activationCode.updateActivationCode(tempUserModel, INDICATORTYPE, data[INDICATORTYPE], (activationData) => {
            //     if (activationData) {
            //         activationCode.sendActivationCode(data[INDICATORTYPE], activationData.activationCode, INDICATORTYPE)
            //     }
            // })
        }
    })

}

//! user forgot password ###




//! user forgot password verify code ###

async function userForgetPasswordVerifyCode(data, res, extra) {
    console.log('-------------00000000', data);
    // let emailRegex = new RegExp(["^", data.email, "$"].join(""), "i")

    users.findOne({ phone: data.phone, activationCode: data.code, removed:false }).then(async doc => {

        if (doc) {
            console.log("code is correct. continue")
            security.sendResponse(res, { status: 200 }, 200, extra)


        } else {
            security.sendResponse(res, { status: 400, message: "Code is not correct" }, 400, extra)

        }



    }).catch(err => {
        console.log(err)
        security.sendResponse(res, { status: 500, code: '#103', message: err.message }, 500, extra, "simpleJson");
    });
}

//! user forgot password verify code ###



//! user forget password post password ###


async function userForgotPasswordPostPassword(data, res, extra) {
    useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "users", async (exist, userErr) => {
        if (userErr) {
            security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra)
            return
        }
        if (!exist) {
            security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists" }, 401, extra)
            return
        }
        if (data.password && data.password.length >= 8) {
            let check = {
                [INDICATORTYPE]: data[INDICATORTYPE],
                activationCode: data.code,
                removed: false
            }
            users.findOne(check).then((user) => {
                if (user) {

                    console.log(user)
                    // const salt = crypto.randomBytes(16).toString("hex")
                    // console.log("hash", data.password)
                    let hash = crypto.scryptSync(data.password, "salt", 64).toString('hex');
                    
                    console.log("hash", hash)
                    
                    users.findOneAndUpdate( check , { password: hash, uDate: new Date() },{new:true}).then((user) => {
                        console.log('uussssssssssssssssseeeeeeeeeerrrrrrrrrrr',user)
                        if(user){

                            useful.loginProcess(user, res, extra)
                        }
                    }).catch((err) => {
                        console.log(err);
                        security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra)
                    })
                } else {
                    security.sendResponse(res, { code: "#133", message: "{{lang}}errors.wrongCredentials" }, 401, extra)
                }
            }).catch((err) => {
                security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra)
            })

        } else {
            security.sendResponse(res, { code: "#132", message: "{{lang}}errors.passwordPattern" }, 401, extra)
        }

    })
}



//! user forget password post password ###




//! get user info

async function userInfoGet(data, res, extra) {



    if (!extra || !extra.security || !extra.session.user) {
        security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists" }, 401, extra)
        return
    }
    users.findOne({ _id: extra.session.user, removed: false }).lean().then((user) => {
        console.log("extra", user)
        if (user) {
            let promises = []
            // promises.push(new Promise((resolve, reject) => {
            //     partnerModel.findOne({ user: extra.session.user, removed: false }).lean().then((partner) => {
            //         user.partner = partner
            //         resolve()
            //     }).catch(() => {
            //         security.sendSomethingWrong(res)
            //         reject()
            //     })

            // }))

            // promises.push(new Promise((resolve, reject) => {
            //     relationsModel.find({ user: extra.session.user, removed: false }).populate('target', 'name family fullname type username image').lean().then((relations) => {
            //         // console.log("relations")
            //         // console.log(relations)

            //         user.relations = relations
            //         resolve()
            //     }).catch(() => {
            //         security.sendSomethingWrong(res)
            //         reject()
            //     })
            // }))

            Promise.all(promises).then(() => {
                // console.log(userUtils.getUserPrivateData(user))
                security.sendResponse(res, { authorized: true, user: userUtils.getUserPrivateData(user) }, 200, extra)

                // // console.table(userUtils.getUserPrivateData(user))

            }).catch(() => {
                security.sendSomethingWrong(res)
            })


        } else {
            security.sendResponse(res, { code: "#133", message: "{{lang}}errors.wrongCredentials" }, 401, extra)
        }
    }).catch((err) => {
        console.log(err)
        security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra)
    })

}

//! get user info




//! get users


async function getUsers(data, res, extra) {

    // console.log("getUsers")
    let filter = data.filter ? useful.filterCreator(data.filter) : {}
    let sort = data.sort ? data.sort : { cDate: -1 }
    let limit = data.limit ? data.limit : null
    let skip = data.skip ? data.limit * data.skip : null
    filter.removed = false
    // console.log(filter)


    users.find(filter).select({ password: 0 }).lean().sort(sort).limit(limit).skip(skip).then((docs) => {

        let promises = []

        Promise.all(promises).then(() => {

            if (data.getCount) {
                users.find(filter).count().then((count) => {
                    security.sendResponse(res, { code: "#132", success: true, count, info: docs }, 200, 'simpleJson')
                })
            } else {
                security.sendResponse(res, { info: docs }, 200, 'simpleJson')
            }

        })

    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })

}


//! get users



//! get users
async function getAllTeachers(data, res, extra) {

    // console.log("getUsers")
    let filter = data.filter ? useful.filterCreator(data.filter) : {}
    filter.status = 'teachers'
    let sort = data.sort ? data.sort : { cDate: -1 }
    let limit = data.limit ? data.limit : null
    let skip = data.skip ? data.limit * data.skip : null
    filter.removed = false
    // console.log(filter)


    users.find(filter).select({ password: 0 }).lean().sort(sort).limit(limit).skip(skip).then((docs) => {

        let promises = []

        Promise.all(promises).then(() => {

            if (data.getCount) {
                users.find(filter).count().then((count) => {
                    security.sendResponse(res, { code: "#132", success: true, count, info: docs }, 200, 'simpleJson')
                })
            } else {
                security.sendResponse(res, { info: docs }, 200, 'simpleJson')
            }

        })

    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })

}


//! get users



//! user auth with code 

async function userSigninRequestCode(data, res, extra) {

    useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "users", async (exist, userErr) => {
        if (userErr) {
            security.sendResponse(res, { code: "#128", message: '{{lang}}errors.somethingWentWrong' }, 500, extra)
            return
        }

        if (exist) {
            activationCode.updateForgetPassActivationCode(users, INDICATORTYPE, data[INDICATORTYPE], (activationData) => {
                if (activationData) {
                    activationCode.sendActivationCode(data[INDICATORTYPE], activationData.activationCode, INDICATORTYPE)
                }
            })
            security.sendResponse(res, { code: "#132", exist: true }, 200, extra)
            return
        } else {
            security.sendResponse(res, { code: "#132", exist: false, authorized: true }, 200, extra)

            // activationCode.updateActivationCode(tempUserModel, INDICATORTYPE, data[INDICATORTYPE], (activationData) => {
            //     if (activationData) {
            //         activationCode.sendActivationCode(data[INDICATORTYPE], activationData.activationCode, INDICATORTYPE)
            //     }
            // })
        }
    })

}

//! user auth with code 



//! User Auth Verify Code 

async function userSigninVerifyCode(data, res, extra) {

    //! we use the userSendCode function to  
    userSendCode(data, res, extra)

}

//! User Auth Verify Code 


//! remove user


async function removeUser(data, res, extra) {
    users.updateOne({ _id: data.id }, {
        removed: true
    }).then((doc) => {
        security.sendResponse(res, { info: doc }, 200, 'simpleJson')
    }).catch(() => {
        security.sendSomethingWrong(res)
    })
}


// async function removeUser(data, res, extra) {


//     if (!extra || !extra.security || !extra.session.user) {
//         security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists" }, 401, extra)
//         return
//     }

//     users.findOne({ _id: extra.session.user, removed: false }).lean().then((user) => {
//         if (user) {
//             partnerModel.findOne({ user: extra.session.user, removed: false }).lean().then((partner) => {
//                 user.partner = partner

//             }).then(() => {

//                 useful.removeQuery(data, res, extra, "users", (removeUser) => { })

//             }).catch(() => { security.sendSomethingWrong(res) })

//         } else {
//             security.sendResponse(res, { code: "#133", message: "{{lang}}errors.wrongCredentials" }, 401, extra)
//         }
//     }).catch((err) => {
//         console.log(err)
//         security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra)
//     })

// }

//! remove user


//! register device

async function userRegisterDevice(data, res, extra) {
    console.log("registerDevice")
    let device = { id: data.id, platform: data.platform }
    console.log(device)

    users.updateOne({ _id: extra.session.user }, { $addToSet: { devices: device, uDate: date } }).then(() => {

        security.sendResponse(res, { code: "#132", success: true }, 200, 'simpleJson')

    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })

}
//! register device


//! unregister device

async function userUnregisterDevice(data, res, extra) {
    console.log("unregisterDevice")

    let device = { id: data.id, platform: data.platform }
    console.log(device)

    users.updateOne({ _id: extra.session.user }, { $pull: { devices: device, uDate: date } }).then(() => {

        security.sendResponse(res, { code: "#132", success: true }, 200, 'simpleJson')

    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })
}

//! unregister device


//! update user
async function userUpdate(data, res, extra) {
    console.log("update user")
    console.log("extra.session.user: ", extra.session.user)
    console.log("extra.session.admin: ", extra.session.admin)
    console.log("data in update user: ", data)


    if (!extra || !extra.security || !extra.session.user) {
        security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists" }, 401, extra)
        return
    }

    users.findOne({ _id: extra.session.user, removed: false }).lean().then((user) => {
        if (user) {
            partnerModel.findOne({ user: extra.session.user, removed: false }).lean().then((partner) => {
                user.partner = partner

            }).then(() => {


                useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "users", (exist, userErr) => {

                    if (userErr) {
                        security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra);
                        return;
                    }
                    if (!exist) {
                        security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists" }, 401, extra);
                        return;
                    } else {
                        let object = {
                            firstName: data.firstName,
                            name: data.name,
                            lastName: data.lastName,
                            fullname: !(data.firstName && data.lastName) ? data.fullname : `${data.firstName} ${data.lastName}`,
                            username: data.username,
                            wallet: data.wallet,
                            commission: data.commission,
                            cover: data.cover,
                            image: data.image,
                            description: data.description,
                            phone: data.phone,
                            email: data.email,
                            type: data.type,
                            credit: data.credit,
                            status: data?.status,
                            document: data.document,
                            [INDICATORTYPE]: data[INDICATORTYPE],
                            contactInfo: data?.contactInfo,
                            location: data.location,
                            mall: data?.mall,
                            brand: data.brand,
                            gender: data.gender,
                            bodyStyle: data.bodyStyle,
                            birthday: data.birthday,
                            weight: data.weight,
                            height: data.height,
                            active: data.active,
                            removed: false,
                            uDate: date
                        }

                        if (data.password) {
                            var hash = crypto.scryptSync(data.password, "salt", 64).toString('hex');
                            object.password = hash
                        }


                        users.findOneAndUpdate({ [INDICATORTYPE]: data[INDICATORTYPE] }, object).select('phone password username name email active gender description image bodyStyle type birthday weight height removed').then((users) => {
                            useful.loginProcess(users, res, extra);
                        }).catch(() => {
                            security.sendSomethingWrong(res)
                        })
                    }
                })




            }).catch(() => { security.sendSomethingWrong(res) })

        } else {
            security.sendResponse(res, { code: "#133", message: "{{lang}}errors.wrongCredentials" }, 401, extra)
        }
    }).catch((err) => {
        console.log(err)
        security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra)
    })
}
//! update user




//! admin update user
async function userUpdateAdmin(data, res, extra) {
    console.log("update user")
    // console.log("extra.session.user: ", extra.session.user)
    // console.log("extra.session.admin: ", extra.session.admin)
    console.log("data in update user: ", data)

    if (!extra || !extra.security || !extra.session.admin) {
        security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists" }, 401, extra)
        return
    }

    users.findOne({ _id: data._id, removed: false }).lean().then((user) => {
        if (user) {



            partnerModel.findOne({ user: extra.session.user, removed: false }).lean().then((partner) => {
                user.partner = partner

            }).then(() => {


                useful.checkUserExist(INDICATORTYPE, data[INDICATORTYPE], "users", (exist, userErr) => {

                    if (userErr) {
                        console.log("USER DOES NOT EXISTS")
                        security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra);
                        return;
                    }
                    if (!exist) {
                        security.sendResponse(res, { code: "#129", message: "{{lang}}errors.userDoesNotExists" }, 401, extra);
                        return;
                    } else {
                        let object = {
                            firstName: data.firstName,
                            name: data.name,
                            lastName: data.lastName,
                            fullname: !(data.firstName && data.lastName) ? data.fullname : `${data.firstName} ${data.lastName}`,
                            username: data.username,
                            cover: data.cover,
                            description: data.description,
                            image: data.image,
                            phone: data.phone,
                            email: data.email,
                            type: data.type,
                            credit: data.credit,
                            status: data?.status,
                            document: data.document,
                            [INDICATORTYPE]: data[INDICATORTYPE],
                            contactInfo: data?.contactInfo,
                            location: data.location,
                            mall: data?.mall,
                            brand: data.brand,
                            gender: data.gender,
                            bodyStyle: data.bodyStyle,
                            birthday: data.birthday,
                            weight: data.weight,
                            height: data.height,
                            active: data.active,
                            removed: false,
                            uDate: date
                        }


                        users.findOneAndUpdate({ [INDICATORTYPE]: data[INDICATORTYPE] }, object).select('phone password username name email active gender description image bodyStyle type birthday weight height removed').then((user) => {
                            security.sendResponse(res, { user: user, auth: { token } }, 200, extra);
                        }).catch((err) => {
                            console.log(err)
                            security.sendSomethingWrong(res)
                        })
                    }
                })

            }).catch((err) => {
                console.log(err)
                security.sendSomethingWrong(res)
            })

        } else {
            security.sendResponse(res, { code: "#133", message: "{{lang}}errors.wrongCredentials" }, 401, extra)
        }
    }).catch((err) => {
        console.log(err)
        security.sendResponse(res, { code: "#128", message: "{{lang}}errors.somethingWentWrong" }, 500, extra)
    })
}
//! admin update user


//! update user info
async function userUpdateInfo(data, res, extra) {

    userUtils.validateUser(data, (valid, errors) => {

        if (valid) {

            users.findOneAndUpdate({ _id: extra.session.user, removed: false }, {
                image:data.image,
                name: data.name,
                family: data.family,
                fullname: `${data.name} ${data.family}`,
                description: data.description,
                contactInfo: data.contactInfo,
                wallet: data.wallet,
                uDate: date
            }).lean().then(user => {
                security.sendResponse(res, { code: "#132", user: user }, 200, extra)
            }).catch(err => {
                security.sendSomethingWrong(res)
            })

        } else {
            security.sendResponse(res, { code: "#137", message: '{{lang}}errors.invalidInputs', errors: errors }, 400, extra)
        }
    })


}

//!getInbox
async function getInbox(data, res, extra) {
    let filter = data.filter

    if (filter == null)
        filter = {}
    if (data.active == null)
        filter['active'] = 1

    filter['removed'] = false


    let newFilter = filter

    let sort = { cDate: -1 }
    if (data.sort) {
        sort = data.sort
    }

    let limit
    let skip

    if (data.limit) {
        limit = data.limit
    }

    if (data.limit && data.skip) {
        skip = data.limit * data.skip
    }

    // console.log(newFilter)

    logsModel.find(newFilter).sort(sort).limit(limit).skip(skip).then(async docs => {

        // logModel.find(newFilter).countDocuments().then(async count => {

        // if (docs.length == 0) {

        if (data.getCount) {

            logsModel.find(newFilter).countDocuments().then(async count => {
                security.sendResponse(res, { status: 200, info: docs, count }, 200, extra, "simpleJson");

            }).catch(err => {
                security.sendResponse(res, { status: 500, code: '#104', message: err.message }, 500, extra, "simpleJson");
            })


        } else {
            security.sendResponse(res, { status: 200, info: docs }, 200, extra, "simpleJson");
        }

    }).catch(err => {
        security.sendResponse(res, { status: 500, code: '#104', message: err.message }, 500, extra, "simpleJson");
    })

};



//!seenInbox
async function seenInbox(data, res, extra) {
    logsModel.updateOne({ _id: data.id }, {
        opened: true
    }).then((docs) => {

        security.sendResponse(res, { status: 200, success: true }, 200, extra, "simpleJson");

        // security.sendResponse(res, { success: true }, 200, extra)

    }).catch(() => { })
};





module.exports = myApiSwitcher;
