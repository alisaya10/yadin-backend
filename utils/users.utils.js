const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const { redisUsers, publisher, subscriber } = require('../variables');

exports.getUserById = (id, cb) => {

    if (id) {
        userModel.findOne({ _id: id, trashed: { $ne: true }, removed: { $ne: true } }).lean().then((user) => {
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
        cDate: data.cDate,
        name: data.name,
        credit: data.credit,
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
        sessionModel.findOne({ userAgent: session.userAgent, user: session.user }).then((doc) => {
            if (!doc) {
                publisher.publish("session.create", JSON.stringify({ session: session }), function() {});
            }
            sessionModel.updateOne({ userAgent: session.userAgent, user: session.user },
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
        userModel.updateOne({ _id: id }, {
            lastActivity: new Date()
        }).then((doc) => {

            if (cb) {
                cb()
            }

        }).catch((err) => {})
    }
}