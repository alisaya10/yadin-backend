const employeeModel = require('../models/employeeModel');
const adminSessionModel = require('../models/adminSessionModel');
const { redisUsers, publisher, subscriber } = require('../variables');

exports.getUserById = (id, cb) => {

    if (id) {
        employeeModel.findOne({ _id: id, trashed: { $ne: true }, removed: { $ne: true } }).lean().then((user) => {
            if (user) {
                cb(user)
            } else {
                cb(null, true)
            }
        }).catch((err) => {
            cb(null, true)

        })
    } else {
        cb(null, true)
    }

}



exports.getUserPublicData = (data) => {

    return {
        _id: data._id,
        id: data._id,
        role: data.role,
        dataname: data.dataname,
        verified: data.verified,
        name: data.name,
        family: data.family,
        fullname: data.fullname,
        image: data.image
    }
};


exports.getUserPrivateData = (data) => {

    return {
        _id: data._id,
        id: data._id,
        role: data.role,
        roles: data.roles,
        dataname: data.dataname,
        verified: data.verified,
        name: data.name,
        family: data.family,
        fullname: data.fullname,
        image: data.image,
        status: data.status,
        phone: data.phone,
        email: data.email,
        balance: data.balance,
        wallet: data.wallet,
        selfBalance: data.selfBalance,
        username: data.username,
        partner: data.partner,


    }
};





// exports.getThingById = (id, cb) => {

//     if (id) {
//         thingsModel.findOne({ _id: id, trashed: { $ne: true }, removed: { $ne: true } }).lean().then((user) => {
//             // console.log("THING GOUND")
//             if (user) {
//                 cb(user)
//             } else {
//                 cb(null, true)
//             }
//         }).catch((err) => {
//             cb(null, true)

//         })
//     } else {

//         cb(null, true)
//     }

// }


exports.saveSessionInfo = (session, cb) => {
    // console.log("saveSession")
    // console.log(session)
    if (session) {
        adminSessionModel.findOne({ userAgent: session.userAgent, user: session.user }).then((doc) => {
            if (!doc) {
                publisher.publish("session.create", JSON.stringify({ session: session }), function() {});
            }
            adminSessionModel.updateOne({ userAgent: session.userAgent, user: session.user },
                session, { upsert: true, new: true, updated: true }).then((session) => {
                // console.log("SESSION CALLBACK:")
                // console.log(session)
                if (cb) {
                    cb(session)
                }

            }).catch((err) => {})
        }).catch((err) => {})
    }
}



exports.saveUserLastActivity = (id, cb) => {
    // console.log("saveUserLastActivity")
    // console.log(id)
    if (id) {
        employeeModel.updateOne({ _id: id }, {
            lastActivity: new Date()
        }).then((doc) => {

            if (cb) {
                cb()
            }

        }).catch((err) => {})
    }
}