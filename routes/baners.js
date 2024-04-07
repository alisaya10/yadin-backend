
var banersModel = require('../models/banersModel');

var useful = require('../utils/useful');

var security = require('../security');

var apisList = {

    'baners/getAll': { function: getAllBaners, security: null }, // REMOVE
    'baners/getOneBaner': { function: getOneBaner, security: null }, // REMOVE
    'baners/postBaner': { function: postBaner, security: null },
    'baners/removeBaner': { function: removeBaner, security: null }, // REMOVE

};

function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList);
}


//! Get One Baner
function getOneBaner(data, res, extra) {
    let filter = data

    banersModel.findOne(filter).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })
}


//! Create/Update Baner
function postBaner(data, res, extra) {
    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        let slug = useful.convertToSlug(data.title)
        data.slug = slug
        banersModel.create({
            image: data.image,
            mobileImage: data.mobileImage,
            pages: data.pages,
            title: data.title,
            description: data.description,
            link: data.link,
            position: data.position,
            creator: extra.session.user,
            categories: data.categories,
            cDate: new Date(),
            uDate: new Date(),
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {
        let slug = useful.convertToSlug(data.slug)
        data.slug = slug

        banersModel.findOneAndUpdate({ _id: data._id }, {
            image: data.image,
            mobileImage: data.mobileImage,
            title: data.title,
            pages: data.pages,
            subTitle: data.subTitle,
            link: data.link,
            position: data.position,
            creator: extra.session.user,
            categories: data.categories,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }
}


async function checkSlug(data, cb) {

    let slug = useful.convertToSlug(data.values.title)
    // console.log(slug)
    data.values.slug = slug
    cb()
}

//! Get All Baners
async function getAllBaners(data, res, extra) {


    useful.getWrapper(data, res, extra, (getWrapper) => {

        getWrapper.filter.removed = false

        getWrapper.populates = [{ path: 'categories', select: 'en' }, { path: 'creator', select: 'name' }]

        useful.findQuery(data, res, extra, "baners", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}

//! Remove Baner
function removeBaner(data, res, extra) {

    useful.removeQuery(data, res, extra, "baners", () => { })

}

module.exports = myApiSwitcher;