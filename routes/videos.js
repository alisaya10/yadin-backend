
var videos = require('../models/videosModel');

var useful = require('../utils/useful');

var security = require('../security');

var apisList = {

    'videos/getAll': { function: getAllvideo, security: null }, // REMOVE
    'videos/getOne': { function: getOnevideo, security: null }, // REMOVE
    'videos/add': { function: postvideo, security: null },
    'videos/remove': { function: removevideo, security: null }, // REMOVE

};

function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList);
} ///////////////////// API Functions

//! Get One Video
function getOnevideo(data, res, extra) {
    let filter = data

    videos.findOne(filter).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })
}


//! Add/Update Video
function postvideo(data, res, extra) {
    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        let slug = useful.convertToSlug(data.video.title)
        data.video.slug = slug
        videos.create({
            page: data.page,
            title: data.title,
            description: data.description,
            Thumbnail: data.Thumbnail,
            video: data.video,
            cDate: new Date(),
            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {
        let slug = useful.convertToSlug(data.values.slug)
        data.values.slug = slug

        videos.findOneAndUpdate({ _id: data._id }, {
            page: data.page,
            values: data.values,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }
}


//! check slug
async function checkSlug(data, cb) {

    let slug = useful.convertToSlug(data.values.title)
    console.log(slug)
    data.values.slug = slug
    cb()
}


//! Get All Videos
async function getAllvideo(data, res, extra) {


    useful.getWrapper(data, res, extra, (getWrapper) => {

        getWrapper.filter.removed = false

        getWrapper.populates = [{ path: 'series', select: 'name' }, { path: 'categories', select: 'values.title' }]

        useful.findQuery(data, res, extra, "videos", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}


//! Remove Video
function removevideo(data, res, extra) {

    useful.removeQuery(data, res, extra, "videos", () => { })

}

module.exports = myApiSwitcher;