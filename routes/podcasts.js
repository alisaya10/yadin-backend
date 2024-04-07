
var podcasts = require('../models/podcastsModel');

var useful = require('../utils/useful');

var security = require('../security');

var apisList = {

    'podcasts/getAll': { function: getAllpodcast, security: null }, // REMOVE
    'podcasts/getOnepodcast': { function: getOnepodcast, security: null }, // REMOVE
    'podcasts/postpodcast': { function: postpodcast, security: null },
    'podcasts/removepodcast': { function: removepodcast, security: null }, // REMOVE

};

function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList);
} ///////////////////// API Functions


function getOnepodcast(data, res, extra) {
    let filter = data

    podcasts.findOne(filter).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })
}

function postpodcast(data, res, extra) {
    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        let slug = useful.convertToSlug(data.podcast.title)
        data.podcast.slug = slug
        podcasts.create({
            page: data.page,
            title: data.title,
            description: data.description,
            podcast: data.podcast,
            thumbnail: data.thumbnail,
            cDate: new Date(),
            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {
        // let slug = useful.convertToSlug(data.values.slug)
        // data.values.slug = slug

        podcasts.findOneAndUpdate({ _id: data._id }, {
            page: data.page,
            title: data.title,
            description: data.description,
            podcast: data.podcast,
            thumbnail: data.thumbnail,
            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }
}

async function checkSlug(data, cb) {

    let slug = useful.convertToSlug(data.values.title)
    console.log(slug)
    data.values.slug = slug
    cb()
}

async function getAllpodcast(data, res, extra) {


    useful.getWrapper(data, res, extra, (getWrapper) => {

        getWrapper.filter.removed = false


        useful.findQuery(data, res, extra, "podcasts", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}



function removepodcast(data, res, extra) {

    useful.removeQuery(data, res, extra, "podcasts", () => { })

}

module.exports = myApiSwitcher;