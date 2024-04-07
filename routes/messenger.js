const useful = require('../utils/useful')
const security = require('../security');
const messengerModel = require('../models/messengerModel');
const messageModel = require('../models/messageModel');
const { v4: uuidv4 } = require('uuid');
// const messengerUserModel = require('../websiteModels/messengerUserModel');
const jwt = require('jsonwebtoken')
const { topicsPublisher, redisMessenger, redisUsers } = require('../variables');
// var ObjectID = require("bson-objectid");
const { ObjectId } = require('mongodb');
const { sequenceGenerator } = require('../utils/generator');
const { nanoid } = require('nanoid');
const courseModel = require('../models/courseModel');

let apisList = {

    'messenger/getMyMessengers': { function: getMyMessengers, security: null },
    'messenger/getMessengerMessages': { function: getMessengerMessages },
    // 'messenger/createGroup': { function: createGroup, security: null },
    'messenger/createTopic': { function: createTopic, security: null },
    // 'messenger/addToGroup': { function: addToGroup, security: null },
    'messenger/removeUser': { function: removeUser, security: null },
    'messenger/deleteMessage': { function: deleteMessage, security: null },
    'messenger/editMessage': { function: editMessage, security: null },
    'messenger/deleteMessenger': { function: deleteMessenger, security: null },

}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions



uSocketMessageSeen = (socket, msg, cb) => {



    //// Find Active Conversation
    console.log('msg', msg)
    getConversationInfo(socket.user, msg.messengerId, (conversation, cerr) => {

        //To DO: Check hub access

        if (cerr) {
            cb(null, true)
            return
        }


        console.log("uSocketMessageSeen")

        console.log(socket.user)
        let key = 'c-' + msg.messengerId

        getUserSequenceInfo(socket.user, key, (usRes, userr) => {

            // redisMessenger.HGET((('hub-seq:' + socket.user)), key, (userr, usRes) => {

            // redisMessenger.HGETALL((('hub-seq:' + socket.user)), (userr, usRes) => {
            if (userr) {
                console.log(userr)
                return
            }

            console.log(usRes)
            let currentSeq = 0
            if (usRes) {
                currentSeq = Number(usRes)
            }
            if (msg.sequence > currentSeq) {

                redisMessenger.HMSET(('hub-seq:' + socket.user), { ['c-' + msg.messengerId]: msg.sequence }, (suerr, suRes) => {

                    if (suerr) {
                        console.log(suerr)
                        return
                    }
                    // addQueue(data, () => {

                    console.log("Sequence Updated")
                    // })


                })
            }

            // })
        })


        let users = conversation.users



        users.forEach(user => {
            UIO.to(String(user)).emit('msgSeen', { by: socket.user, message: msg.messageId, messenger: msg.messengerId, sequence: msg.sequence })
        })

        // topicsPublisher.publish("topics.post.msgSeen", JSON.stringify({ data: inboxObject }), function () { });


        messageModel.updateOne({ _id: msg.messageId }, {

            status: 2,
            uDate: new Date()

        }).then((nmsg) => { }).catch(err => {
            console.log(err)
        })

        cb()

    })

}

function getMessengerApplets(data, res, extra) {
    console.log('getMessengerApplets')
    console.log('pppp', data)
    let filter = { features: 'Messenger', trashed: false }
    appletModel.find(filter).populate('hub', 'fullname name family username image role type').lean().then((docs) => {
        console.log('founded', docs)
        security.sendResponse(res, { info: docs, done: true }, 200, 'simpleJson')
    })
}
function getParents(data, res, extra) {
    let filter = { parent: data._id, trashed: false, 'intractiveUser.hub': extra.session.user }
    messengerModel.find(filter).lean().then((docs) => {
        security.sendResponse(res, { info: docs, done: true }, 200, "simpleJson")
    })
}
function editMessage(data, res, extra) {
    console.log('editMessage')
    let newMsg = data.newMsg
    let object = {}
    let now = new Date()
    messageModel.findOne({ _id: data.message }).lean().then((doc) => {
        console.log(doc)
        data.messenger = doc.messenger
        data.modified = { lastMsg: doc.text, newMsg: newMsg }
        messageModel.findOneAndUpdate({ _id: data.message }, { text: newMsg, edited: true, uDate: now }, { new: true }).lean().then((msg) => {
            messengerModel.findOne({ _id: doc.messenger }).lean().then((messenger) => {
                sendSystemMessage(messenger, 'edited', data, null, () => {
                    security.sendResponse(res, { done: true }, 200, 'simpleJson')
                })
            })
        })
    })
}
function deleteMessage(data, res, extra) {
    console.log(data)
    if (data.type == 'all') {
        messageModel.findOneAndUpdate({ _id: data.message }, { trashed: true }, { new: true }).lean().then((doc) => {
            data.message = doc._id
            console.log('done')
            sendSystemMessage(data.messenger, 'deleted', data, null, () => {
                security.sendResponse(res, { done: true }, 200, 'simpleJson')
            })
        })
    }
    else {
        let object = { $push: { removedBy: { user: data.hub } } }
        messageModel.findOneAndUpdate({ _id: data.message }, object, { new: true }).lean().then((doc) => {
            data.message = doc._id
            sendSystemMessage(data.messenger, 'deletedForMe', data, extra.session.user, () => {
                security.sendResponse(res, { done: true, info: doc }, 200, 'simpleJson')
            })
        })
    }
}
function deleteMessenger(data, res, extra) {
    console.log('deleteMessenger')
    let messenger = data.messenger
    let hub = data.hub
    messageModel.findOne({ messenger: messenger }).sort({ cDate: 'desc' }).lean().then((msg) => {
        console.log('msg', msg)
        messengerModel.findOne({ _id: messenger }).lean().then((messengerDoc) => {
            let found = false
            for (let i = 0; i < messengerDoc.accessLimit.length; i++) {
                if (String(messengerDoc?.accessLimit[i].user) == extra.session.user) {
                    found = true
                }
            }
            if (found) {
                messengerModel.findOneAndUpdate({ _id: messenger, 'accessLimit.user': extra.session.user },
                    {
                        $set: {
                            'accessLimit.$.seq': msg.sequence,
                            'accessLimit.$.removed': true,

                        }, uDate: new Date()
                    }, { new: true }).lean().then((doc) => {
                        security.sendResponse(res, { done: true, info: doc }, 200, 'simpleJson')
                    })
            }
            else {
                messengerModel.findOneAndUpdate({ _id: messenger },
                    { $push: { accessLimit: { user: hub, seq: msg.sequence, removed: true } } }, { new: true }).lean().then((doc) => {
                        security.sendResponse(res, { done: true, info: doc }, 200, 'simpleJson')
                    })
            }
        })

    })
}
function removeUser(data, res, extra) {
    console.log('removeUser')
    console.log('data', data)
    if (data.type == 'leave') {
        messengerModel.findOneAndUpdate({ _id: data.messenger }, { $pull: { users: extra.session.user }, uDate: new Date() }, { new: true }).populate('users').lean().then((messenger) => {
            console.log('messenger user', messenger)
            // let message = `user ${data.fullname} removed`

            sendSystemMessage(messenger, null, data, null, () => {
                console.log('document is', messenger)
                security.sendResponse(res, { info: messenger, done: true }, 200, "simpleJson")
            })
        })

    }
    else {

        messengerModel.findOneAndUpdate({ _id: data.messenger }, { $pull: { users: data.hub }, uDate: new Date() }, { new: true }).populate('users').lean().then((messenger) => {
            console.log('messenger user', messenger)
            // let message = `user ${data.fullname} removed`

            sendSystemMessage(messenger, null, data, null, () => {
                console.log('document is', messenger)
                security.sendResponse(res, { info: messenger, done: true }, 200, "simpleJson")
            })
        })
    }

}
function sendSystemMessage(messenger, action, extra, personal, cb) {
    // msg.sender = msg.applet.hub

    let message = {}
    let now = new Date()
    let id = ObjectId().toString()
    message._id = id
    // message.sender = socket.user
    message.cDate = now
    message.uDate = now
    message.status = 1
    console.log('extra is ', extra)
    if (!action) {

        message.systemInfo = {
            name: extra.fullname ? extra.fullname : extra.name,
            user: extra._id,
            type: extra.type
        }
        message.type = 'system'
    }
    else {

        message.type = 'action'
        message.action = {
            type: action,
            message: extra.message,

        }
        message.modified = extra?.modified && extra.modified
    }
    message.messenger = messenger._id ? messenger._id : messenger
    // message.tempId = msg.tempId
    // message.tz = msg.tz
    // message.text = msg

    sequenceGenerator("messenger-" + message.messenger, (sequence) => {
        // addQueue()
        message.sequence = sequence
        console.log(sequence)
        console.log('message', message)
        console.log('messenger', messenger)

        sendMessageToRecipients(null, message, messenger, personal, sequence)
        console.log('here', message)
        saveMessage(message, now, null, (cmsg) => {
            console.log('done')
            cb()
        })

        // let key = 'c-' + messenger?._id
        // getUserSequenceInfo(socket.user, key, (usRes, userr) => {
        //     if (userr) { return }
        //     redisMessenger.HMSET(('hub-seq:' + socket.user), { [key]: sequence }, (suerr, suRes) => {
        //         if (suerr) {
        //             console.log(suerr)
        //             return
        //         }
        //         console.log("hub Sequence Updated On send Message")
        //     })
        // })
    })

}
function createGroup(data, extra, cb) {

    console.log('data,', data)
    if (!data._id) {

        let users = data.hubs

        console.log('users', users)
        messengerModel.create({
            users: users,
            name: data.name,
            description: data.description,
            type: 'group',
            status: 0,
            creator: extra.session.user,
            cDate: new Date(),
            uDate: new Date(),
            trashed: false
        }).then((newMessenger) => {
            messengerModel.findOne({ _id: newMessenger._id }).populate('users').lean().then((doc) => {
                let extra = {
                    name: doc.name,
                    type: 'created'
                }
                sendSystemMessage(doc, null, extra, null, () => {
                    cb(doc)
                    // security.sendResponse(res, { info: doc }, 200, "simpleJson")
                })
                // for (let i = 0; i < doc.intractiveUsers.length; i++) {

                // }
            })
        })
    }
    else {
        messengerModel.findOneAndUpdate({ _id: data._id }, { name: data.messengerName }, { new: true }).lean().then((doc) => {
            for (let i = 0; i < doc.users.length; i++) {
                UIO.to(String(doc.users[i])).emit('messengerUpdated', doc)
            }
        })
    }

}

function addToGroup(data, cb) {
    console.log('addtogroup')
    let user = data.user
    let course = data.course
    courseModel.findOne({ _id: course }).lean().then((courseDoc) => {
        messengerModel.findOneAndUpdate({ _id: courseDoc.group }, { $push: { users: user } }, { new: true }).lean().then((doc) => {
            // security.sendResponse(res, { info: doc }, 200, 'simpleJson')

            cb()
        }).catch((e) => {
            console.log(e)
        })
    }).catch((e) => {
        console.log(e)
    })

}

function createTopic(data, res, extra) {
    let object = {
        name: data.topic,
        parent: data.messenger,
        settings: data.settings,
    }
    messengerModel.findOne({ _id: object.parent }).populate('users').lean().then((messenger) => {
        if (messenger != null) {
            messengerModel.create({
                name: object.name,
                users: messenger.users,
                status: messenger.status,
                settings: object.settings,
                type: 'topic',
                parent: object.parent,
                cDate: new Date(),
                uDate: new Date(),
                trashed: false
            }).then((newMessenger) => {
                messengerModel.findOne({ _id: newMessenger._id }).lean().then((doc) => {
                    // sendSystemMessage(doc, null, extra, null, () => {
                    security.sendResponse(res, { info: doc }, 200, "simpleJson")
                    // })
                })
                // newMessenger.visitor = visitor
                // let token = jwt.sign({ id: visitor._id, type: 'visitor' }, process.env.securityCode)
            })


        }
    })

}

getUserSequenceInfo = (user, key, cb) => {

    if (key) {
        redisMessenger.HGET((('hub-seq:' + user)), key, (userr, usRes) => {

            if (userr) {
                cb(null, userr)
                return
            }

            if (usRes) {
                cb(usRes)
            } else {
                cb()
            }

        })
    } else {

        redisMessenger.HGETALL((('hub-seq:' + user)), (userr, usRes) => {
            if (userr) {
                cb(null, userr)
                return
            }

            if (usRes) {
                cb(usRes)
            } else {
                cb()
            }

        })

    }
}

uSocketHandleNotif = (socket, data, cb) => {
    if (data.type == 'isTyping') {
        console.log(data)
        messengerModel.findOne({ _id: data.messenger }).lean().then((doc) => {
            let user = socket.user
            for (let i = 0; i < doc.users.length; i++) {
                if (socket.user != doc.users[i]) {
                    UIO.to(String(doc.users[i])).emit('useNotif', { activity: 'isTyping', user: user, value: data.value, messenger: data.messenger })
                }
            }
            cb()
        })

    }

}
uSocketgetHubStatus = (socket, data, cb) => {
    // messengerModel.findOne({ _id: data.messengerId }).lean().then((doc) => {
    //     for (let i = 0; i < doc.intractiveUsers.length; i++) {
    //         if (socket.user != doc.intractiveUsers[i].hub) {
    redisUsers.HGETALL("user:" + String(data.hub), (err, result) => {
        cb(result)
    })
    //         }
    //     }
    // })
}

uSocketCreateMesseger = (socket, data, cb) => {
    console.log("uSocketCreateMessager")
    if (!data.type) {
        let user = extra.session.user
        let potentialUser = data.potentialApplet

        let users = [user, potentialUser]

        console.log('potentialApplet', potentialApplet)
        console.log('userApplet', userApplet)

        //TODO: CHECK BLOCK AND ETC
        let promises = []
        let type = ''
        Promise.all(promises).then(() => {
            console.log('promise', users)
            messengerModel.findOne({ users: { "$size": 2, $all: users }, type: { $ne: 'group' } }).populate('users').lean().then((messenger) => {

                if (messenger) {
                    // console.log("exists")
                    cb({ messenger: messenger })

                } else {

                    console.log("create")


                    // return


                    messengerModel.create({
                        users: users,
                        type: type && type,
                        status: 0,
                        cDate: new Date(),
                        uDate: new Date(),
                        trashed: false
                    }).then((newMessenger) => {
                        messengerModel.findOne({ _id: newMessenger._id }).populate('users').lean().then((doc) => {
                            console.log('messenger ', doc._id, 'created')
                            cb({ messenger: doc })
                        })
                        // newMessenger.visitor = visitor
                        // let token = jwt.sign({ id: visitor._id, type: 'visitor' }, process.env.securityCode)
                    })


                }
            })
        })

        // intractiveUsers: [{ hub: user, applet: userApplet }, { hub: sendHub, applet: potentialUserApplet }],

        // let userApplet = doc._id
        // let sendHub = connection.hub

        // appletModel.findOne({ hub: socket.user, features: "Messenger" }).lean().then((doc) => {

        // connectionModel.findOne({ applet: potentialUserApplet }).lean().then((connection) => {


        // })
        // })
    }
    else {

    }
    // return

    // console.log(visitorInfo)

    // useful.getRequestInfo(socket.handshake, (reqInfo) => {
    //     console.log(reqInfo)
    // })
    // cb({ messenger: 'test' })

    // return
    // console.log(socket.handshake.headers)

}


uSokcetCheckIfMessengerExists = (socket, msg, cb) => {
    console.log('msg', msg)

    let potentialUser = msg.potentialUser
    let user = socket.user
    let promises = []

    console.log('uSocket Check if')
    console.log(user)
    console.log(potentialUser)
    messengerModel.findOne({ users: { "$size": 2, $all: [user, potentialUser] }, trashed: false, type: { $ne: 'group' } }).populate('users').lean().then((messenger) => {
        console.log('messenger is 10', messenger)
        if (messenger != null) {
            cb({ messenger: messenger })
        }
        else {
            console.log('tp1')
            let users = [user, potentialUser]

            console.log(users)
            console.log('tp2')

            messengerModel.create({
                users: users,
                status: 0,
                cDate: new Date(),
                uDate: new Date(),
                trashed: false
            }).then((newMessenger) => {
                console.log('Tp0')
                messengerModel.findOne({ _id: newMessenger._id }).populate('users').lean().then((doc) => {
                    console.log('messenger ', doc._id, 'created')
                    cb({ messenger: doc })
                })
                // newMessenger.visitor = visitor
                // let token = jwt.sign({ id: visitor._id, type: 'visitor' }, process.env.securityCode)
            }).catch((e) => {
                console.log(e)
            })
        }

    }).catch(() => {

    })

    // }
    // let user = socket.user
    // let potentialUser = msg.potentialUser

    // messengerModel.findOne({ users: { "$size": 2, $all: [user, potentialUser] } }).populate('users').lean().then((messenger) => {

}



uSocketSendMessage = (socket, msg, cb) => {
    console.log("uSocketMessage")
    console.log(msg)

    // return

    if (msg && msg.messenger && socket.user) {


        getConversationInfo(socket.user, msg.messenger, (conversation, cerr) => {
            console.log('here', conversation)
            if (cerr) {
                console.log('true')
                cb(null, true)
                return
            }

            sendMessageAction(socket, msg, conversation, cb)
        })
        // redisMessenger.HGETALL('conversation:' + msg.messenger, (err, messenger) => {

        //     // console.log(messenger)

        //     if (err) {
        //         cb(null, true)
        //         return
        //     }

        //     if (messenger) {

        //         sendMessageAction(socket, msg, JSON.parse(messenger.object), cb)

        //     } else {
        //         activateConversation(socket, msg, (messenger, aerr) => {

        //             if (aerr) {
        //                 cb(null, true)
        //                 return
        //             }
        //             sendMessageAction(socket, msg, messenger, cb)


        //         })
        //     }
        // })
    } else {
        cb(null, true)
    }

}




getConversationInfo = (user, id, cb) => {

    redisMessenger.HGETALL('conversation:' + id, (err, messenger) => {


        if (err) {
            console.log('err')
            cb(null, true)
            return
        }

        if (messenger) {
            console.log('messenger')

            cb(JSON.parse(messenger.object))

        } else {
            console.log('here activateConversation ')
            activateConversation(user, id, (messenger, aerr) => {

                if (aerr) {
                    cb(null, true)
                    return
                }
                cb(messenger)
            })
        }
    })

}




activateConversation = (user, id, cb) => {

    console.log("activateConversation", user, 'id', id)

    // TO DO: Activate messenger on database
    messengerModel.findOne({ _id: id, users: user }).populate('users').lean().then((messenger) => {

        if (messenger) {
            console.log('founded')
            messengerModel.findOne({ messenger: id }).then((messege) => {
                console.log('founded2')

                let sequence = messege?.sequence

                if (!sequence) {
                    sequence = 0
                }

                redisMessenger.HMSET(('conversation:' + messenger._id), { sequence, object: JSON.stringify(messenger) }, (err, uResualt) => {

                    if (err) {
                        console.log(err)
                        cb(null, true)
                        return
                    }

                    console.log(sequence, "activateConversation Done")


                    cb(messenger, sequence)

                })
            })

        } else {
            cb(null, true)
        }


    }).catch(() => {
        cb(null, true)
    })

}





sendMessageAction = (socket, msg, messenger, cb) => {

    console.log("sendMessageAction")
    msg.senderHub = socket.user
    // msg.sender = msg.applet.hub

    let message = {}
    let now = new Date()
    let id = ObjectId().toString()
    message = msg
    message._id = id
    // message.sender = socket.user
    message.cDate = now
    message.uDate = now
    message.status = 1
    message.messenger = msg.messenger
    message.tempId = msg.tempId
    message.tz = msg.tz
    message.text = msg.text

    message.senderHub = socket.user
    // message.sender = msg.sender
    console.log('====applet', msg)
    // appletModel.findOne({ _id: msg.applet, features: "Messenger" }).lean().then((doc) => {
    //     connectionModel.findOne({ applet: doc._id }).lean().then((connection) => {
    message.sender = msg.sender

    // message.sender = msg.applet.hub._id
    sequenceGenerator("messenger-" + messenger?._id, (sequence) => {

        message.sequence = sequence
        console.log(sequence)

        sendMessageToRecipients(socket, message, messenger, false, sequence)
        cb(message)

        saveMessage(message, now, socket.user, (cmsg) => {
            // sendMessageToRecipients(cmsg)
            // if (cmsg) {
            //     cb(cmsg._id)
            // }
        })



        let key = 'c-' + messenger?._id

        getUserSequenceInfo(socket.user, key, (usRes, userr) => {

            if (userr) { return }

            redisMessenger.HMSET(('hub-seq:' + socket.user), { [key]: sequence }, (suerr, suRes) => {

                if (suerr) {
                    console.log(suerr)
                    return
                }

                console.log("hub Sequence Updated On send Message")

            })
        })
        // })
    })
    //     })
    // })
    // })

    // })



}





saveMessage = (message, now, user, cb) => {

    messageModel.create(message).then(doc => {

        // console.log(doc)
        // cb(doc)
    }).catch(err => {
        console.log(err)
        cb(null, err)
    })
    let object = { _id: message.messenger }
    messengerModel.updateOne({ _id: message.messenger }, {
        uDate: now,
        $set: {
            'accessLimit.$[].removed': false,
        }


    }).then(() => {
        cb(doc)
    }).catch(err => cb(null, err))

}

sendMessageToRecipients = (socket, msg, messenger, personal, sequence) => {


    console.log("sendMessageToRecipients")
    // let users = []
    if (personal) {
        users = [ personal ]
    }
    else {
        users = messenger.users
    }
    // console.log(users)
    // console.log('sequence is ', sequence)
    let object = { socket: socket?.id, message: msg }
    if (sequence == 1 || messenger) {
        console.log('true', messenger)
        object = { socket: socket?.id, message: msg, messenger: messenger }
    }
    users.forEach(oneUser => {
        console.log('object', object)
        let user = oneUser._id ? oneUser._id : oneUser
        console.log('hub11', user)
        UIO.to(String(user)).emit('newMsg', object)
    });


    // topicsPublisher.publish("topics.post.msg", JSON.stringify({ data: inboxObject }), function () { });

}


async function getMessengerMessages(data, res, extra) {

    let limit = 20
    let skip = data.skip ? data.limit * data.skip : 0
    sort = { cDate: -1 }
    let obj = { messenger: data.messenger, 'removedBy.user': { $ne: extra.session.user } }
    if (data.lastMsg) {
        obj._id = { $lt: data.lastMsg }
    }
    messengerModel.findOne({ _id: data.messenger }).lean().then((doc) => {
        let seq = 0
        console.log(doc)
        for (let i = 0; i < doc.accessLimit.length; i++) {
            if (doc.accessLimit[i].user == extra.session.user) {
                seq = doc.accessLimit[i].seq
            }
        }
        if (seq != 0) {
            obj.sequence = { $gt: seq }
        }
        messageModel.find(obj).sort(sort).limit(limit).skip(skip).then((messages) => {
            console.log('getMessengerMessages')
            console.log(messages)
            security.sendResponse(res, { done: true, info: messages }, 200, 'simpleJson')
        }).catch((err) => {
            console.log(err)
        })
    })

}




async function getMyMessengers(data, res, extra) {

    // console.log("getMyMessengers")
    let user = extra.session.user
    let filter = { users: extra.session.user, trashed: false, $or: [{ 'accessLimit.user': { $nin: [extra.session.user] } }, { accessLimit: { $elemMatch: { 'user': extra.session.user, 'removed': false } } }] }
    // TO DO: APPLET BASE AND PERMISSION
    messengerModel.find(filter).populate('users', 'name fullname image username').lean().then((messengers) => {

        let messages = {}
        let notifs = {}
        let promises = []


        getUserSequenceInfo(user, null, (sequences, seqerr) => {
            console.log("sequences")
            console.log(sequences)
            if (!sequences) {
                sequences = {}
            }
            messengers.forEach((messenger) => {

                promises.push(new Promise((resolve, reject) => {

                    // messageModel.find({ messenger: messenger._id, _id: { $gt: messenger.lastSeen } }).count().then((count) => {
                    let limit = 1000
                    let hcSeq = sequences['c-' + messenger._id] ? sequences['c-' + messenger._id] : 0
                    if (!hcSeq) {
                        limit = 1
                    }
                    messageModel.find({ messenger: messenger._id, sequence: { $gte: hcSeq }, type: { $ne: 'action' }, 'removedBy.refHub': { $ne: extra.session.user } }).limit(limit).sort({ sequence: -1 }).then((msg) => {
                        let count = ((msg[0] && msg[0]?.sequence) ? msg[0]?.sequence : 0) - hcSeq

                        notifs[messenger._id] = count

                        messages[messenger._id] = msg

                        console.log("hcSeq")
                        console.log(hcSeq)
                        console.log("lsm")
                        console.log(msg)

                        resolve()
                    }).catch(err => {
                        console.log(err)
                        // res.send({ status: 500, code: '103', message: err.message })
                        reject()
                    })
                    // }).catch(err => {
                    //     // res.send({ status: 500, code: '103', message: err.message })
                    //     reject()
                    // })
                }))

            })


            Promise.all(promises).then(() => {

                security.sendResponse(res, { done: true, info: messengers, messages, notifs }, 200, 'simpleJson')

            }).catch(() => {
                security.sendSomethingWrong(res)
            })
        })


        // security.sendResponse(res, { done: true, info: messengers }, 200, 'simpleJson')

    })

}
















module.exports = { myApiSwitcher, uSokcetCheckIfMessengerExists, uSocketSendMessage, uSocketHandleNotif, uSocketgetHubStatus, uSocketCreateMesseger, uSocketMessageSeen, createGroup, addToGroup }