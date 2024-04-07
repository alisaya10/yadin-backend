const { redisUsers, publisher, subscriber } = require('../variables');
var cron = require('node-cron');
const { getUserById, saveSessionInfo, saveUserLastActivity } = require('../utils/users.utils');
const { JsonWebTokenError } = require('jsonwebtoken');

const forceOfflineMinutes = 1
const forceOfflineCheckMinutes = 1


subscriber.subscribe("user.online");
subscriber.subscribe("user.offline");
subscriber.subscribe("user.singin");
subscriber.subscribe("user.signup");
subscriber.subscribe("session.open");
subscriber.subscribe("session.close");
subscriber.subscribe("session.create");
subscriber.subscribe("user.updated");



subscriber.on("message", function(channel, rawData) {
    // console.log(channel)
    let data = JSON.parse(rawData)

    if (channel == 'user.online') {
        userOnline(data)
    }
    if (channel == 'user.offline') {
        userOffline(data)
    }
    if (channel == 'user.singin') {
        userSignin(data)
    }
    if (channel == 'user.signup') {
        userSignup(data)
    }
    if (channel == 'session.open') {
        sessionOpen(data)
    }
    if (channel == 'session.close') {
        sessionClose(data)
    }
    if (channel == 'session.create') {
        sessionCreated(data)
    }

    if (channel == 'user.updated') {
        userUpdated(data)
    }
});


function userUpdated(data) {
    redisUsers.HGETALL('user:' + data.user, (err, result) => {
        let newObject = result
        for (const [key, value] of Object.entries(data.object)) {
            let newValue = value
            if (typeof value == 'object') {
                newValue = JSON.stringify(value)
            }
            newObject[key] = newValue
        }

        redisUsers.HMSET(('user:' + data.user), newObject, (err, uResualt) => {})
    })
}



function userOnline(data) {
    // console.log(data)
    lastActivityUpdater(data.user.id, null, true)
    saveUserLastActivity(data.user.id, () => {})
    console.log("user: " + data.user.id + ' is now online');

}


function userOffline(data) {
    lastActivityUpdater(data.user.id, null, false)
    saveUserLastActivity(data.user.id, () => {})

    console.log("user: " + data.user.id + ' is now offline');
}


function userSignin(data) {
    usersSessionUpdater(data.user, data.requestInfo, () => {})
    console.log("user signedin: " + data.user.id)
}

function userSignup(data) {

}

function sessionCreated(data) {
    // TO DO
    console.log("SESSION CREATED :" + data.session.key)
}


function sessionOpen(data) {

    // console.log("OPEN SESSION *")
    // console.log(data)

    lastActivityUpdater(null, data.session.key, true)
    data.session.lastActivity = new Date().getTime()
    data.session.status = 1

    saveSessionInfo(data.session, () => {})
}

function sessionClose(data) {
    // lastActivityUpdater(null, data.session.key, false)
    data.session.lastActivity = new Date().getTime()
    data.session.status = 1
    saveSessionInfo(data.session, () => {})
}






// update last activity - USER AND SESSION
function lastActivityUpdater(userId, sessionKey, online) {
    let now = new Date().getTime()
    if (online) {
        if (sessionKey) {
            // console.log("UPDATE SESSION REDIS")
            redisUsers.ZADD('SLDate', now, 'usersession:' + sessionKey)
            redisUsers.HSET('usersession:' + sessionKey, "LADate", now, "status", 1, (err, result) => {})
        }

        if (userId) {
            // console.log("UPDATE USER REDIS")
            redisUsers.HSET('user:' + userId, "LADate", now, "status", 1, (err, result) => {})
            redisUsers.ZADD('ULDate', now, 'user:' + userId)
        }
    } else {
        // if (sessionKey) {
        //     redisUsers.HMSET('session:' + sessionKey, { LADate: now, status: 0 }, (err, result) => {})
        // }

        if (userId) {
            redisUsers.HSET('user:' + userId, "LADate", now, "status", 0, (err, result) => {})
        }
    }
}





// function checkSetUserOnline(userInfo, sessionKey, requestInfo, cb) {

//     redisUsers.HGET('user:' + userInfo._id, (err, result) => {
//         if (!result || result.status == 0) {
//             publisher.publish("user.online", { user: userInfo, sessionKey, requestInfo }, function() {});
//         } else {
//             redisUsers.HMSET('user:' + userInfo._id, { status: 1, roles: userInfo.roles }, (err, userInfo) => {
//                 if (cb) {
//                     cb(userInfo)
//                 }
//             })
//         }
//     })
// }





// function checkGetUserOnline(sessionInfo, requestInfo, cb) {

//     redisUsers.HGET('user:' + sessionInfo.userId, (err, result) => {
//         if (!result || result.status == 0) {

//             getUserById(sessionInfo.userId, (userInfo, err) => {
//                 if (err) {
//                     cb(null, true)
//                 } else {
//                     redisUsers.HMSET('user:' + userInfo._id, { status: 1, roles: userInfo.roles }, (err, nResualt) => {
//                         if (cb) {
//                             publisher.publish("user.online", { session: sessionInfo, requestInfo }, function() {});
//                             cb(userInfo)
//                         }
//                     })
//                 }

//             })

//         } else {
//             // redisUsers.HMSET('user:' + userInfo._id, { status: 1, roles: userInfo.roles }, (err, userInfo) => {
//             //     if (cb) {
//             cb(result)
//                 //     }
//                 // })
//         }
//     })
// }



function openNewSession(sessionKey, sessionInfo, requestInfo, cb) {
    // {{ Online User }}
    // {{ publish user.online }}
    // let now = new Date().getTime()

    // console.log("OPEN NEW SESSION")
    // console.log(sessionInfo)

    redisUsers.HMSET('usersession:' + sessionKey, sessionInfo, (err, result) => {

            // console.log(err)
            // console.log(result)

            sessionInfo.key = sessionKey

            publisher.publish("session.open", JSON.stringify({ session: sessionInfo, requestInfo: requestInfo }), function() {});

            // checkGetUserOnline(sessionInfo, requestInfo, () => {
            cb(sessionInfo)
                // })
        })
        // activityUpdater(userInfo._id, sessionKey)

}




function getCreateSessionInfo(sessionKey, userClaimedInfo, requestInfo, cb) {

    // console.log(sessionKey)
    // console.log(userClaimedInfo)

    let newSessionInfo = { status: 1, user: userClaimedInfo.id, token: userClaimedInfo.token, ip: requestInfo.ip, userAgent: requestInfo.userAgent }
        // console.log("NEW SESSION INFO")
        // console.log(sessionKey)
        // newSessionInfo
    redisUsers.HGETALL('usersession:' + sessionKey, (err, session) => {
        // console.log("__ SESSION")
        // console.log(session)
        if (err) {
            // console.log(err)
            cb(null, true)
            return
        }
        if (session && session.user) {
            if (session.user != userClaimedInfo.id) {
                // console.log("USER ID NOT EQUAL")
                // console.log(session.user)
                // console.log(userClaimedInfo.id)
                cb(null, true)
                return
            }

            // console.log("SESSION EXISTS")
            if (session.status != 1) {
                openNewSession(sessionKey, newSessionInfo, requestInfo, () => {})
                    // redisUsers.HMSET('session:' + sessionKey, { status: 1 }, (err, session) => {})
                    // publisher.publish("session.open", { session: sessionInfo, request: requestInfo }, function() {});
                session.status = 1
            } else {
                lastActivityUpdater(null, sessionKey, true)
                    // UPDATE LAST ACTIVITY
            }
            // console.log("EEE")
            cb(session)
            return

        } else {
            openNewSession(sessionKey, newSessionInfo, requestInfo, (session, err) => {
                // console.log("DDD")

                cb(session)
                return
            })
        }
    })

}



function getCreateUserSessionInfo(session, cb) {
    // console.log(session)
    redisUsers.HGETALL('user:' + session.user, (err, result) => {
        // console.log("TEST RES")
        // console.log(result)
        if (!result || result.status == 0) {

            getUserById(session.user, (userInfo, err) => {
                if (err || !userInfo) {
                    cb(null, true)
                } else {
                    // console.log("ROLES")
                    // console.log(userInfo.roles)
                    redisUsers.HMSET(('user:' + userInfo._id), { status: 1, roles: (Array.isArray(userInfo.roles) ? JSON.stringify(userInfo.roles) : userInfo.roles) }, (err, uResualt) => {
                        let uInfo = { id: userInfo._id, roles: userInfo.roles }
                        publisher.publish("user.online", JSON.stringify({ user: uInfo, session }), function() {});
                        cb(uInfo)
                    })
                }

            })

        } else {
            // console.log("USER IS ONLINE")

            lastActivityUpdater(session.user, null, true)
            cb(result)
        }
    })

}




function usersSessionUpdater(userClaimedInfo, extra, cb) {

    // console.log(extra)

    console.log(userClaimedInfo?.id)

    if (userClaimedInfo && userClaimedInfo.id) {
        let sessionKey = userClaimedInfo.sessionKey ? userClaimedInfo.sessionKey : userClaimedInfo.token
        if (sessionKey) {
            getCreateSessionInfo(sessionKey, userClaimedInfo, extra.info, (session, err) => {
                if (err) {
                    console.log("getCreateSessionInfo ERR")
                    cb(null, err)
                    return
                }
                // console.log('------')
                // console.log(err)
                // console.log(session)
                getCreateUserSessionInfo(session, (userSession, err) => {
                        if (err) {
                            console.log("getCreateUserSessionInfo ERR")
                            cb(null, err)
                            return
                        }
                        session.roles = userSession.roles
                        cb(session)

                    })
                    // if (sessionInfo.userId == userClaimedInfo.id) {
                    // TO DO: CHECK SESSION INFO VALIDATION

                // if (result.status != 1) {
                //     redisUsers.HMSET('session:' + sessionKey, { status: 1 }, (err, result) => {})
                //     publisher.publish("session.open", { session: sessionInfo, request: requestInfo }, function() {});
                // }

                // checkGetUserOnline(sessionInfo, requestInfo, (userInfo, err) => {
                //     if (err) {
                //         cb(null, true)
                //         return
                //     }
                //     cb({ user: userClaimedInfo.id, roles: userInfo.roles, token: userClaimedInfo.token, sessionKey })
                //     activityUpdater(true, userClaimedInfo.id, sessionKey)
                // })

                // } else {
                //     cb(null, true)
                // }

                // } else {
                //     getUserById(userClaimedInfo.id, (userInfo, err) => {
                //         if (err) {
                //             cb(null, true)
                //         } else {
                //             openNewSession(userInfo, sessionKey, requestInfo, () => {

                //                 activityUpdater(true, userClaimedInfo.id, sessionKey)

                //                 cb({ user: userClaimedInfo.id, roles: userInfo.roles, token: userClaimedInfo.token, sessionKey })
                //             })

                //         }
                //     })
                // }
            })
        } else {
            cb({})
        }
    } else {
        cb({})
    }

}






async function usersForceOffline(users, now) {

    // console.log("usersForceOffline")

    if (Array.isArray(users)) {
        users.forEach(user => {
            // console.log(user + ' OFFLINE !')
            redisUsers.HGETALL(user, (err, fullUser) => {
                if (fullUser) {
                    // redisUsers.HMSET(user, { status: 0 }, (err, result) => {
                    let id = user.split(':')
                    if (id[0] == "user") {
                        fullUser.id = id[1] ? id[1] : id[0]
                        fullUser.status = 0
                        publisher.publish("user.offline", JSON.stringify({ user: fullUser }), function() {});
                    }
                }
            })
        });
    }

    redisUsers.ZREMRANGEBYSCORE('ULDate', '-inf', (now - (forceOfflineMinutes * 60000)))

}


async function sessionsForceOffline(sessions, now) {

    // console.log(sessions)
    if (Array.isArray(sessions)) {
        sessions.forEach(session => {
            // console.log(session + ' CLOSE')
            redisUsers.HGETALL(session, (err, fullSession) => {
                if (fullSession) {
                    let key = session.split(':')
                    if (key[0] == "usersession") {
                        redisUsers.DEL(session, (err, result) => {
                            fullSession.key = key[1] ? key[1] : key[0]
                            publisher.publish("session.close", JSON.stringify({ session: fullSession }), function() {});
                        })
                    }

                }
            })
        });
    }

    redisUsers.ZREMRANGEBYSCORE('SLDate', '-inf', (now - (forceOfflineMinutes * 60000)))

}


// CHECK USERS AND SESSIONS FORCE OFFLINE
cron.schedule('*/' + forceOfflineCheckMinutes + ' * * * *', () => {
    // console.log("check offline users")

    let now = new Date().getTime()
    redisUsers.ZRANGEBYSCORE('ULDate', '-inf', (now - (forceOfflineMinutes * 60000)), (err, result) => {
        if (!err) {
            usersForceOffline(result, now)
        }
    })

    // console.log("check offline Sessions")

    redisUsers.ZRANGEBYSCORE('SLDate', '-inf', (now - (forceOfflineMinutes * 60000)), (err, result) => {
        if (!err) {
            sessionsForceOffline(result, now)
        }
    })

})


module.exports = {
    usersSessionUpdater
}