const { redisThings, publisher, subscriber } = require('../variables');
var cron = require('node-cron');
const { getThingById, saveSessionInfo } = require('../utils/rigram.utils');

const forceOfflineMinutes = 20
const forceOfflineCheckMinutes = 2



function thingsSessionUpdater(claimedInfo, extra, cb) {

    if (claimedInfo && claimedInfo.id) {
        let sessionKey = claimedInfo.sessionKey ? claimedInfo.sessionKey : claimedInfo.token
        if (sessionKey) {
            getCreateSessionInfo(sessionKey, claimedInfo, extra.info, (session, err) => {
                if (err) {
                    console.log("getCreateSessionInfo ERR")
                    cb(null, err)
                    return
                }

                getCreateThingSessionInfo(session, (userSession, err) => {
                    if (err) {
                        console.log("getCreateThingSessionInfo ERR")
                        cb(null, err)
                        return
                    }
                    session.roles = userSession.roles
                    session.owner = userSession.owner

                    cb(session)
                })
            })
        } else {
            cb({})
        }
    } else {
        cb({})
    }

}





function getCreateSessionInfo(sessionKey, claimedInfo, requestInfo, cb) {

    let newSessionInfo = { status: 1, thing: claimedInfo.id, token: claimedInfo.token, ip: requestInfo.ip, userAgent: requestInfo.userAgent }

    redisThings.HGETALL('thingsession:' + sessionKey, (err, session) => {

        if (err) {
            cb(null, true)
            return
        }
        if (session && session.thing) {
            if (session.thing != claimedInfo.id) {
                cb(null, true)
                return
            }

            // console.log("SESSION EXISTS")
            if (session.status != 1) {
                openNewSession(sessionKey, newSessionInfo, requestInfo, () => {})

                session.status = 1
            } else {
                lastActivityUpdater(null, sessionKey, true)
            }
            cb(session)
            return

        } else {
            openNewSession(sessionKey, newSessionInfo, requestInfo, (session, err) => {
                cb(session)
                return
            })
        }
    })

}



function getCreateThingSessionInfo(session, cb) {

    redisThings.HGETALL('thing:' + session.thing, (err, result) => {

        // console.log('!@##')
        // console.log(result)
        // console.log(session.thing)
        if (!result || result.status == 0) {

            getThingById(session.thing, (thingInfo, err) => {
                // console.log(thingInfo)
                // console.log("ERR")
                if (err || !thingInfo) {
                    cb(null, true)
                    return
                } else {
                    // console.log(String(thingInfo.owner))
                    redisThings.HMSET('thing:' + thingInfo._id, { owner: String(thingInfo.owner), status: 1 }, (rerr, uResualt) => {
                        // console.log("HOOra")
                        // console.log(rerr)
                        let uInfo = { id: thingInfo._id, owner: thingInfo.owner, }
                        publisher.publish("thing.online", JSON.stringify({ thing: uInfo, session }), function() {});
                        // console.log(uInfo)
                        cb(uInfo)
                        return
                    })
                }

            })

        } else {
            // console.log("THING IS ONLINE")
            lastActivityUpdater(session.thing, null, true)
            cb(result)
        }
    })

}





function openNewSession(sessionKey, sessionInfo, requestInfo, cb) {

    // console.log("OPEN NEW SESSION")
    redisThings.HMSET('thingsession:' + sessionKey, sessionInfo, (err, result) => {

        sessionInfo.key = sessionKey

        publisher.publish("thing.session.open", JSON.stringify({ session: sessionInfo, requestInfo: requestInfo }), function() {});

        cb(sessionInfo)

    })

}





// update last activity - THING AND SESSION
function lastActivityUpdater(thingId, sessionKey, online) {
    let now = new Date().getTime()
    if (online) {
        if (sessionKey) {
            // console.log("UPDATE THING REDIS")
            redisThings.ZADD('SLDate', now, 'thingsession:' + sessionKey)
            redisThings.HSET('thingsession:' + sessionKey, "LADate", now, "status", 1, (err, result) => {})
        }

        if (thingId) {
            // redisThings.HGETALL('thing:' + session.thing, (err, result) => {
            // console.log("lastActivityUpdater")
            // console.log(thingId)
            // console.log("UPDATE THING REDIS")
            // redisThings.HSET('thing:' + thingId, "LADate", now, "status", 1, (err, result) => {})
            // redisThings.HMSET('thing:' + thingId, "LADate", now, "status", 1, (err, result) => { })

            redisThings.ZADD('ULDate', now, 'thing:' + thingId)

            // })
        }
    } else {

        if (thingId) {
            redisThings.HSET('thing:' + thingId, "LADate", now, "status", 0, (err, result) => {})
        }
    }
}









async function thingsForceOffline(things, now) {

    // console.log("thingsForceOffline")
    if (Array.isArray(things)) {
        things.forEach(thing => {
            // console.log(thing + ' OFFLINE #')
            redisThings.HGETALL(thing, (err, fullthing) => {

                if (fullthing) {
                    let id = thing.split(':')
                    if (id[0] == "thing") {
                        fullthing.id = id[1] ? id[1] : id[0]
                        fullthing.status = 0
                        publisher.publish("thing.offline", JSON.stringify({ thing: fullthing }), function() {});
                    }
                }
            })
        });
    }

    redisThings.ZREMRANGEBYSCORE('ULDate', '-inf', (now - (forceOfflineMinutes * 60000)))

}


async function sessionsForceOffline(sessions, now) {

    if (Array.isArray(sessions)) {
        sessions.forEach(session => {
            // console.log(session + ' CLOSE')
            redisThings.HGETALL(session, (err, fullSession) => {
                if (fullSession) {
                    let key = session.split(':')
                    if (key[0] == "thingsession") {
                        redisThings.DEL(session, (err, result) => {
                            fullSession.key = key[1] ? key[1] : key[0]
                            publisher.publish("thing.session.close", JSON.stringify({ session: fullSession }), function() {});
                        })
                    }

                }
            })
        });
    }

    redisThings.ZREMRANGEBYSCORE('SLDate', '-inf', (now - (forceOfflineMinutes * 60000)))

}


// CHECK USERS AND SESSIONS FORCE OFFLINE
cron.schedule('*/' + forceOfflineCheckMinutes + ' * * * *', () => {

    let now = new Date().getTime()
    redisThings.ZRANGEBYSCORE('ULDate', '-inf', (now - (forceOfflineMinutes * 60000)), (err, result) => {
        if (!err) {
            thingsForceOffline(result, now)
        }
    })

    redisThings.ZRANGEBYSCORE('SLDate', '-inf', (now - (forceOfflineMinutes * 60000)), (err, result) => {
        if (!err) {
            sessionsForceOffline(result, now)
        }
    })

})







subscriber.subscribe("thing.online");
subscriber.subscribe("thing.offline");
subscriber.subscribe("thing.singin");
subscriber.subscribe("thing.signup");
subscriber.subscribe("thing.session.open");
subscriber.subscribe("thing.session.close");
subscriber.subscribe("thing.session.create");



subscriber.on("message", function(channel, rawData) {
    let data = JSON.parse(rawData)

    if (channel == 'thing.online') {
        thingOnline(data)
    }
    if (channel == 'thing.offline') {
        thingOffline(data)
    }
    if (channel == 'thing.singin') {
        thingSignin(data)
    }
    if (channel == 'thing.signup') {
        thingSignup(data)
    }

    if (channel == 'thing.removed') {
        thingRemoved(data)
    }

    if (channel == 'thing.session.open') {
        sessionOpen(data)
    }
    if (channel == 'thing.session.close') {
        sessionClose(data)
    }
    if (channel == 'thing.session.create') {
        sessionCreated(data)
    }
});


function thingOnline(data) {
    lastActivityUpdater(data.thing.id, null, true)
        // console.log("thing: " + data.thing.id + ' is now online');
}


function thingOffline(data) {
    lastActivityUpdater(data.thing.id, null, false)
        // console.log("thing: " + data.thing.id + ' is now offline');
}


function thingSignin(data) {
    thingsSessionUpdater(data.thing, data.requestInfo, () => {})
        // console.log("thing signedin: " + data.thing.id)
}

function thingSignup(data) {

}

function sessionCreated(data) {
    console.log("SESSION CREATED :" + data.session.key)
}


function sessionOpen(data) {

    // console.log("OPEN SESSION *")

    lastActivityUpdater(null, data.session.key, true)
    data.session.lastActivity = new Date().getTime()
    data.session.status = 1

}

function sessionClose(data) {
    data.session.lastActivity = new Date().getTime()
    data.session.status = 1
}



function thingRemoved(data) {

    TIO.to(data.gateway).emit('message', { type: 'Removed', thing: data.id })

    // lastActivityUpdater(data.thing.id, null, true)
    // console.log("thing: " + data.thing.id + ' is now online');
}


module.exports = {
    thingsSessionUpdater
}