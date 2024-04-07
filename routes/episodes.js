
var episodesModel = require('../models/episodesModel');

var useful = require('../utils/useful');

var security = require('../security');

var apisList = {

    'episodes/getAll': { function: getEpisodes, security: null }, // REMOVE
    'episodes/getOne': { function: getOneEpisode, security: null }, // REMOVE
    'episodes/post': { function: postEpisode, security: null },
    'episodes/remove': { function: removeEpisode, security: null }, // REMOVE

};

function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList);
} ///////////////////// API Functions


function getOneEpisode(data, res, extra) {
    let filter = data

    episodesModel.findOne(filter).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })
}

function postEpisode(data, res, extra) {
    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        // let slug = useful.convertToSlug(data.podcast.title)
        // data.podcast.slug = slug
        episodesModel.create({
            title: data.title,
            description: data.description,
            image: data.image,
            series: data.series,
            slides: data.slides,
            audio: data.audio,

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

        episodesModel.findOneAndUpdate({ _id: data._id }, {
            title: data.title,
            description: data.description,
            image: data.image,
            series: data.series,
            slides: data.slides,
            audio: data.audio,

            uDate: new Date(),
            creator: extra.session.user,
            removed: false
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }
}


async function getEpisodes(data, res, extra) {


    useful.getWrapper(data, res, extra, (getWrapper) => {

        getWrapper.filter.removed = false

        getWrapper.populates = [{ path: 'series', select: 'name' }]

        useful.findQuery(data, res, extra, "episodes", getWrapper, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })


    })


}



function removeEpisode(data, res, extra) {

    useful.removeQuery(data, res, extra, "episodes", () => { })

}

module.exports = myApiSwitcher;