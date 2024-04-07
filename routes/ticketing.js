const useful = require('../utils/useful')
const security = require('../security');
const ticketModel = require('../models/ticketModel');
const ticketReplyModel = require('../models/ticketReplyModel');


let apisList = {

    'ticketing/getTickets': { function: getTickets, security: null },
    'ticketing/getMyTickets': { function: getMyTickets, security: ['token'] },

    'ticketing/getOneTicket': { function: getOneTicket, security: null },
    'ticketing/postTicket': { function: postTicket, security: null },
    'ticketing/removeTicket': { function: removeTicket, security: null },
    'ticketing/searchTickets': { function: searchTickets, security: null },


    'ticketing/postTicketReply': { function: postTicketReply, security: null },
    // 'ticketing/removeAnswer': { function: removeAnswer, security: null },
    // 'ticketing/getAnswers': { function: getAnswers, security: null },


}


function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}


///////////////////// API Functions



async function postTicketReply(data, res, extra) {

    let promises = []
    let status = '2'
    let object = {
        ticket: data.ticket,
        body: data.body,
        lng: data.lng,
        attachments: data.attachments,
        isAdminReply: data.isAdminReply
    }

    if (extra.session.roles && (extra.session.roles.includes('admin') || extra.session.roles.includes('superadmin'))) {

        // object.status = data.status

    }

    if (data.isAdminReply) {
        status = '3'
    }

    // if (!data._id) {
    //     object.status = '0'
    // }

    Promise.all(promises).then(() => {

        console.log("extra.session.user")
        console.log(extra.session.user)

        let populates = [{ path: 'ticket', select: 'title image' }, { path: 'creator', select: 'name family fullname image username' }]

        useful.postQuery(data, res, extra, "ticketReplys", object, populates, (queryResult, err) => {

            if (!err) {

                // if (!data._id) {
                ticketModel.findOneAndUpdate({ _id: object.ticket }, { status: status, uDate: new Date() }, { new: true }).populate('creator', 'name family fullname image username').then((newParent) => {
                        security.sendResponse(res, { done: true, info: queryResult, parent: newParent }, 200, 'simpleJson')
                    })
                    // }

            } else {
                console.log(err)
                security.sendSomethingWrong(res)
            }
        })
    }).catch(() => {
        security.sendSomethingWrong(res)
    })

}





async function searchTickets(data, res, extra) {

    let myRegex = new RegExp([data.search].join(""), "i")

    let filter = { 'title': { $regex: myRegex } }
    filter.removed = false
    if (data.lng != null) {
        filter['lng'] = data.lng
    }

    ticketModel.find(filter).lean().limit(20).select({ body: 0 }).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })

}




async function getOneTicket(data, res, extra) {

    let filter = data
    filter.removed = false

    ticketModel.findOneAndUpdate(filter, { $inc: { views: 1 } }, { new: true }).populate('creator', 'name family fullname image username').lean().then((doc) => {

        ticketReplyModel.find({ ticket: doc._id, removed: false }).sort({ cDate: -1 }).populate('creator', 'name family fullname image username').then((answers) => {

            security.sendResponse(res, { info: doc, answers }, 200, 'simpleJson')



        })
    }).catch(() => { security.sendSomethingWrong(res) })

}







async function postTicket(data, res, extra) {

console.log('data', data);
    let object = {
        title: data.title,
        category: data.category,
        body: data.body,
        email: data.email,
        phone: data.phone,
        topic: data.topic,
        lng: data.lng,
        attachments: data.attachments,
        status: data.status
    }

    if (!data._id) {
        object.status = '0'
    }

// console.log('object',extra.session.roles);
    // if (data.status && extra.session.roles && (extra.session.roles.includes('admin') || extra.session.roles.includes('superadmin'))) {

        // object.status = data.status

    // }




    let promises = []


    if (!data._id) {
        promises.push(new Promise((resolve, reject) => {
            useful.generateAutoNumber('Ticket', 'TK-', (id) => {
                // console.log(id)
                if (id) {
                    object.id = id
                    resolve()

                } else {
                    reject()
                }
            })
        }))
    }


    Promise.all(promises).then(() => {
        let populates = []

        useful.postQuery(data, res, extra, "tickets", object, populates, (queryResult, err) => {

            if (!err) {
                security.sendResponse(res, { done: true, info: queryResult }, 200, 'simpleJson')
            } else {
                console.log(err)
                security.sendSomethingWrong(res)
            }
        })
    }).catch((err) => {
        console.log("err")
        console.log(err)
        security.sendSomethingWrong(res)
    })

}





async function getMyTickets(data, res, extra) {

    console.log("MY extra.session.user")

    console.log(extra.session.user)

    if (extra.session.user) {

        useful.getWrapper(data, res, extra, (wrapperRes) => {

            wrapperRes.filter.removed = false
            wrapperRes.filter.creator = extra.session.user

            wrapperRes.populates = [ { path: 'creator', select: 'name family fullname image username' }]

            console.log(wrapperRes)
            useful.findQuery(data, res, extra, "tickets", wrapperRes, (docs, count, err) => {
                if (err) {
                    console.log(err)
                    security.sendSomethingWrong(res)
                } else {
                    security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
                }
            })
        })
    } else {
        security.sendPermissionDenied(res)

    }
}



async function getTickets(data, res, extra) {


    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false
        if (data.lng) {
            wrapperRes.filter['lng'] = data.lng
        }

        wrapperRes.populates = [ { path: 'creator', select: 'name family fullname image username' }]

        // console.log(wrapperRes)
        useful.findQuery(data, res, extra, "tickets", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}



async function removeTicket(data, res, extra) {

    // console.log(data)
    ticketModel.updateOne({ _id: data.id }, {
        removed: true
    }, { upsert: false }).then(() => {

        security.sendResponse(res, { done: true }, 200, 'simpleJson')

    }).catch((err) => {
        console.log(err);
        security.sendSomethingWrong(res)
    })

}






module.exports = myApiSwitcher