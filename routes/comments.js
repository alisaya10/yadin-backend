//? model
const commentsModel = require('../models/commentsModel');


//? useful
const useful = require('../utils/useful')

//? security
const security = require('../security');
const userModel = require("../models/userModel");
// const wishListModel = require("../models/wishlistModel");


let apisList = {

    //! Add Comment
    'comments/add': { function: addComment, security: null },

    //! Get All Comments
    'comments/getAll': { function: getAllComments, security: null },

    //! Get verified Comments
    'comments/getVerfied': { function: getVerfiedComments, security: null },

    //! Get one Comment
    'comments/getOne': { function: getOneComment, security: null },

    //! Remove Comment
    'comments/remove': { function: removeComment, security: null },

}

//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher



//! create/update Comment
async function addComment(data, res, extra) {

    // console.log("data", data)


    let object = {
        body: data.body,
        parent: data.parent,
        course: data.course,
        teacher: data.teacher,
        writer: extra.session.user,
        status: data.status,
        cDate: new Date(),
        uDate: new Date(),
        removed: false
    }


    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        commentsModel.create(object).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {

        commentsModel.findOneAndUpdate({ _id: data._id }, {
            body: data.body,
            parent: data.parent,
            writer: extra.session.user,
            course: data.course,
            teacher: data.teacher,
            status: data.status,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }

}


//! Get All Comments
async function getAllComments(data, res, extra) {
    // console.log("test0")

    useful.getWrapper(data, res, extra, (getWrapper) => {

        getWrapper.filter.removed = false

        getWrapper.populates =[{ path: 'writer', select: 'name family fullname image' }]

        useful.findQuery(data, res, extra, "comments", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                // console.log("comments: ", docs)
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}


//! get verified comments
async function getVerfiedComments(data, res, extra) {
    useful.getWrapper(data, res, extra, (getWrapper) => {

        getWrapper.filter.removed = false

        getWrapper.filter.verified = '1'

        getWrapper.populates = [{ path: 'parent', select: 'body' }, { path: 'advertisement' }]

        useful.findQuery(data, res, extra, "comments", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                // console.log("comments: ", docs)
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })
}


//! get one Comment
async function getOneComment(data, res, extra) {
    let filter = data
    filter.removed = false
    // console.log(filter)
    commentsModel.findOne(filter).populate('parent').populate('writer').lean().then((doc) => {
        security.sendResponse(res, { info: doc }, 200, 'simpleJson')
    }).catch((err) => {
        console.log(err)
        security.sendSomethingWrong(res)
    })
}


//! remove Comment
async function removeComment(data, res, extra) {

    useful.removeQuery(data, res, extra, "comments", () => { })

}


module.exports = myApiSwitcher