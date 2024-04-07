const useful = require('../utils/useful')
const security = require('../security');
const { rigramPublisher, topicsPublisher, bssPublisher } = require('../variables');
const dataLogModel = require('../models/dataLogModel');
const connectionModel = require('../models/connectionModel');


let apisList = {

    'receive/postData': { function: postData, security: ['tToken'] },
    'receive/postHistory': { function: postHistory, security: ['tToken'] },
    'receive/getThingHistory': { function: getThingHistory, security: ['token'] },
    'receive/getConnectedThings': { function: getConnectedThings, security: ['token'] },
    'receive/postActionTrigger': { function: postActionTrigger, security: ['token'] },

}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions




async function postActionTrigger(data, res, extra) {
    // console.log(extra.session.user)
    // console.log(data.dashboard)
    connectionModel.findOne({ user: extra.session.user, dTarget: data.dashboard }).then((connection) => {
        // console.log(connection)
        if (connection) {

            rigramPublisher.publish("rigram.post.action", JSON.stringify({ data, extra }), function() {});

            // thingsModel.find({ gateway: data.id }).populate('brand').populate('categories').lean().then((docs) => {

            security.sendResponse(res, { info: { success: true }, success: true }, 200, 'simpleJson')

            // }).catch(() => { security.sendSomethingWrong(res) })

        } else {
            security.sendPermissionDenied(res)
        }

    }).catch(() => { security.sendSomethingWrong(res) })

}



async function getConnectedThings(data, res, extra) {

    if (data.id) {

        thingsModel.findOne({ _id: data.id }).then((thing) => {

            if (thing) {
                // let promises = []
                let gateway = data.id

                if (thing.type != 'Gateway') {
                    gateway = thing.gateway

                    // Promise.all(promises).then(() => {
                    thingsModel.find({ _id: gateway, removed: false }).populate('brand').populate('categories').lean().then((docs) => {

                        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

                    }).catch(() => { security.sendSomethingWrong(res) })

                    // }).catch(() => { security.sendSomethingWrong(res) })


                } else {

                    // Promise.all(promises).then(() => {
                    thingsModel.find({ gateway, removed: false }).populate('brand').populate('categories').lean().then((docs) => {

                        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

                    }).catch(() => { security.sendSomethingWrong(res) })

                    // }).catch(() => { security.sendSomethingWrong(res) })
                }
            } else {
                security.sendNotFound(res)
            }
        })

    } else {
        security.sendNotFound(res)
    }
}


async function getThingHistory(data, res, extra) {


    if (data.filter && data.filter.thing) {
        let filter = data.filter ? data.filter : {}
        let sort = data.sort ? data.sort : { cDate: -1 }
        let limit = data.limit ? data.limit : null
        let skip = data.skip ? data.limit * data.skip : null

        filter.trashed = false
            // filter.thing = 

        dataLogModel.find(filter).lean().sort(sort).limit(limit).skip(skip).then((docs) => {

            security.sendResponse(res, { info: docs }, 200, 'simpleJson')

        }).catch(() => { security.sendSomethingWrong(res) })

    } else {
        security.sendNotFound(res)
    }


}



async function postHistory(data, res, extra) {

    security.sendResponse(res, { success: true }, 200, 'simpleJson')

}


async function postData(data, res, extra) {

    console.log("postData")

    console.log(data)
    thingsModel.findOne({ uId: data.uId, removed: { $ne: true } }).then((thing) => {
        if (thing) {
            console.log("Thing Found")
            data._id = thing._id
            data.price = thing.price

            let now = new Date()

            // console.log(data)

            logData(data, extra, now, () => {})

            updateLastValue(data, extra, thing, now, (result, err) => {

                // console.log(result)
                if (err) {
                    security.sendSomethingWrong(res)
                    return
                }
                if (result) {
                    data.characteristics = result.characteristics
                }

                delete extra.headers
                rigramPublisher.publish("rigram.post.new", JSON.stringify({ data, extra }), function() {});
                topicsPublisher.publish("topics.post.new", JSON.stringify({ data, extra }), function() {});
                bssPublisher.publish("bss.post.new", JSON.stringify({ data, extra, user: extra.session.owner, isOwner: true }), function() {});

                security.sendResponse(res, { success: true }, 200, 'simpleJson')

            })

        } else {
            security.sendNotFound(res)
        }

    }).catch((err) => {
        // console.log(err)
        security.sendNotFound(res)
    })
}


async function logData(data, extra, now, cb) {

    console.log("logData")
    dataLogModel.create({
        thing: data._id,
        gateway: extra.session.thing,
        thingTimestamp: data.timeStamp,

        data: data.data,
        cDate: now,
        trashed: false
    }).then((result) => {
        cb(result)
    }).catch((err) => cb(null, err))

}



function updateLastValue(data, extra, thing, now, cb) {

    console.log("updateLastValue")
    let latestData = thing.latestData
    if (!latestData) {
        latestData = {}
    }

    // let object = { lastActivity: now, latestData: latestData }
    // console.log("NOW")
    // console.log(now)
    let object = { lastActivity: now }
    let characteristics = []

    if (Array.isArray(thing.structure)) {
        for (let i = 0; i < thing.structure.length; i++) {
            const element = thing.structure[i];
            let value = useful.getObject(data.data, element.dataObject)
            if (value != null) {
                object['latestData.' + element.dataObject] = value
                characteristics.push(element.dataObject)
            }
        }
    }

    // console.log(object)
    // console.log(extra.session.thing)

    // for (const [key, value] of Object.entries(data.data)) {
    //     if (typeof value == 'object' && !Array.isArray(value)) {

    //     } else {
    //         object.latestData[key] = value
    //     }
    // }

    // thingsModel.findOne({ gateway: extra.session.thing, uId: data.uId }).then((doc) => {
    //     console.log(doc)
    // })

    thingsModel.updateOne({ gateway: extra.session.thing, uId: data.uId, removed: { $ne: true } }, object).then((thing) => {

        cb({ characteristics })

    }).catch((err) => {
        console.log(err)
        cb(null, true)
    })
}



module.exports = {
    postData
}