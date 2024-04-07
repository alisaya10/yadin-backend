//? model
const brodcastsModel = require('../models/brodcastsModel');
const usersModel = require('../models/userModel');
const brodcastsFeedModel = require('../models/brodcastsFeedModel');

const useful = require('../utils/useful')
const security = require('../security');


let apisList = {

    'broadcasts/getBroadcasts': { function: getBroadcasts, security: null },

    'broadcasts/postBroadcast': { function: postBroadcast, security: null },

    'broadcasts/removeBroadcast': { function: removeBroadcast, security: null },

    'broadcasts/getBroadcastsFeed': { function: getBroadcastsFeed, security: null },


    'broadcasts/seenAllBroadcasts': { function: seenAllBroadcasts, security: null },

    'broadcasts/seenBroadcast': { function: seenBroadcast, security: null },

}

function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}







async function seenAllBroadcasts(data, res, extra) {

    brodcastsFeedModel.updateMany({ user: extra.session.user, opened: false }, {
        opened: true,

    }, { multi: true }).then((docs) => {

        security.sendResponse(res, { success: true }, 200, extra)

    }).catch(() => { })

}



async function postBroadcast(data, res, extra) {

    let now = new Date()
    let object = {
        title: data.title,
        public: data.public,
        users: data.users,
        message: data.message,
        cDate: now,
        uDate: now,
        creator: extra.session.user,
        removed: false
    }

    if (!data._id) {
        if (object.public === true) {

            brodcastsModel.create(object).then((message) => {

                function FindBrodcast(index = 0) {
                    usersModel.find({}).limit(100).skip(100 * index).then((users) => {
                        const UsersPromise = [];
                        UsersPromise.push(new Promise((resolve, reject) => {
                            users.forEach(user => {
                                brodcastsFeedModel.create({
                                    message: message._id,
                                    user: user._id,
                                    cDate: now,
                                    uDate: now
                                }).then(() => {
                                    resolve()
                                })
                            })
                        }))

                        Promise.all(UsersPromise).then(() => {
                            index = + 1;
                            FindBrodcast(index)
                        }).then(() => {
                            security.sendResponse(res, { info: message }, 200, extra)
                        })

                    })

                }

                FindBrodcast()

            })

        }
        else {

            brodcastsModel.create(object).then((message) => {
                // console.log("dd", data)
                data.users.forEach(user => {
                    brodcastsFeedModel.create({
                        message: message._id,
                        user: user,
                        uDate: now,
                        cDate: now,

                    }).then(() => {
                        security.sendResponse(res, { info:message }, 200, extra)
                    })
                })
            })
        }
    } else {

        brodcastsModel.updateOne({ _id: data._id, cDate: now, uDate: now }, object).then((doc) => {

            security.sendResponse(res, { info: doc }, 200, extra)

        }).catch(() => { })
    }

}


async function getBroadcasts(data, res, extra) {


    useful.getWrapper(data, res, extra, (getWrapper) => {


        getWrapper.filter.removed = false

        // console.log(getWrapper)

        useful.findQuery(data, res, extra, "brodcasts", getWrapper, (docs, count, err) => {
            // console.log(docs)
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}


async function getBroadcastsFeed(data, res, extra) {



    useful.getWrapper(data, res, extra, (getWrapper) => {

        // console.log(getWrapper)

        getWrapper.filter.removed = false
        getWrapper.filter.user = extra.session.user

        if (data.opened != null) {
            getWrapper.filter.opened = data.opened
        }



        getWrapper.populates = [{ path: 'message', select: 'title message' }]



        useful.findQuery(data, res, extra, "brodcastsFeed", getWrapper, (docs, count, err) => {
            // console.log(docs)
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}


async function seenBroadcast(data, res, extra) {

    brodcastsFeedModel.updateOne({ _id: data.id }, {
        opened: true
    }).then((docs) => {

        security.sendResponse(res, { success: true }, 200, extra)

    }).catch(() => { })

}


async function removeBroadcast(data, res, extra) {

    useful.removeQuery(data, res, extra, "brodcasts", () => {

        brodcastsFeedModel.remove({ message: data.id }).then(() => {
            security.sendResponse(res, { success: true }, 200, extra)
        }).catch(() => { })
    })

}



module.exports = myApiSwitcher