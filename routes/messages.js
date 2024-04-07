//? model
const brodcastsModel = require('../models/brodcast');
const usersModel = require('../models/userModel');
const brodcastsFeedModel = require('../models/brodcastFeedModel');
const inboxModel = require('../models/inboxModel');

//? useful
const useful = require('../utils/useful')

//? security
const security = require('../security');


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


//Todo dont forget to set model and functions


let apisList = {

    //! get messages
    'messages/getMessages': { function: getMessages, security: null },

    //! post messages
    'messages/postMessage': { function: postMessages, security: null },

    //! remove messages
    'messages/removeMessage': { function: removeMessages, security: null },

    //! get message feeds
    'messages/getMessageFeeds': { function: getMessageFeeds, security: null },

    //! get inbox
    'messages/getSeenBradcast': { function: getSeenBradcast, security: null },

    //! seen inbox
    'messages/seenBradcast': { function: seenBradcast, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher



//! post message


async function postMessages(data, res, extra) {


    let object = {
        title: data.title,
        public: data.public,
        users: data.users,
        message: data.message,
        cDate: new Date(),
        uDate: new Date(),
        creator: extra.session.user,
        removed: false
    }


    if (object.public === true) {

        console.log("TP1")


        function FindBrodcast(index = 0) {
            brodcastsModel.create(object).then((message) => {
                usersModel.find({}).limit(100).skip(100 * index).then((doc) => {
                    const UsersPromise = [];
                    UsersPromise.push(new Promise((resolve, reject) => {
                        doc.forEach(user => {
                            brodcastsFeedModel.create({
                                message: message._id,
                                user: user._id
                            }).then(() => {
                                resolve()
                            })
                        })
                    }))

                    Promise.all(UsersPromise).then(() => {
                        index = + 1;
                        FindBrodcast(index)
                    }).then(() => {
                        security.sendResponse(res, { insert: "inserted in data" }, 200, extra)
                    })

                })
            })
        }

        FindBrodcast()

    }
    else {

        brodcastsModel.create(object).then((message) => {
            console.log("dd", data)
            data.users.forEach(user => {
                brodcastsFeedModel.create({
                    message: message._id,
                    user: user
                }).then(() => {
                    security.sendResponse(res, { insert: "inserted in data" }, 200, extra)
                })
            })


        })
    }


}
//! post messages




//! get messages


async function getMessages(data, res, extra) {

    console.log("data", data)



    useful.getWrapper(data, res, extra, (getWrapper) => {

        console.log(getWrapper)

        getWrapper.filter.removed = false

        console.log(getWrapper)

        useful.findQuery(data, res, extra, "brodcasts", getWrapper, (docs, count, err) => {
            console.log(docs)
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}

//! get messages



//! get message feed


async function getMessageFeeds(data, res, extra) {

    console.log("data", data)



    useful.getWrapper(data, res, extra, (getWrapper) => {

        console.log(getWrapper)

        getWrapper.filter.removed = false

        console.log(getWrapper)

        getWrapper.populates = [{ path: 'message', select: 'title message' }]

        useful.findQuery(data, res, extra, "brodcastsFeed", getWrapper, (docs, count, err) => {
            console.log(docs)
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}

//! get messages feed


//! get seen inbox

async function getSeenBradcast(data, res, extra) {

    brodcastsModel.find({ user: extra.session.user, removed: false }).sort({ cDate: -1 }).limit(100).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, extra)

    }).catch(() => { })

}

//! get seen inbox


//! seen inbox

async function seenBradcast(data, res, extra) {

    brodcastsModel.updateOne({ _id: data.id }, {
        isSeen: true
    }).then((docs) => {

        security.sendResponse(res, { success: true }, 200, extra)

    }).catch(() => { })

}

//! get get inbox


//! remove message
async function removeMessages(data, res, extra) {

    useful.removeQuery(data, res, extra, "brodcasts", () => { })

}
//! remove message



module.exports = myApiSwitcher