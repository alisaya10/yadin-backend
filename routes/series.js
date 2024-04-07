const seriesModel = require('../models/seriesModel');


//? useful
const useful = require('../utils/useful')

//?  security
const security = require('../security');

let apisList = {

    //! add series
    'series/add': { function: addseries, security: null },

    //! get all series
    'series/getAll': { function: getAllseries, security: null },

    //! remove series
    'series/Remove': { function: Removeseries, security: null },

    //! get special series
    'series/getspecial': { function: getSpecialSeries, security: null },

}


//* myApiSwitcher
function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList)
}
//* myApiSwitcher


//! add series
async function addseries(data, res, extra) {

    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        seriesModel.create({
            name: data.name,
            description: data.description,
            thumbnail: data.thumbnail,
            category: data.category,
            type: data.type,
            body: data.body,
            cDate: new Date(),
            uDate: new Date(),
            creator: extra.session.user,
            special: data.special,
            removed: false
        }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })

    } else {


        seriesModel.findOneAndUpdate({ _id: data._id }, {
            name: data.name,
            description: data.description,
            type: data.type,
            thumbnail: data.thumbnail,
            category: data.category,
            creator: extra.session.user,
            special: data.special,
            uDate: new Date(),
        }, { new: true }).then((result) => {
            security.sendResponse(res, { done: true, info: result }, 200, 'simpleJson')
        }).catch(() => { security.sendSomethingWrong(res) })
    }


}


//! get all series
async function getAllseries(data, res, extra) {


    // console.log('get')



    useful.getWrapper(data, res, extra, (wrapperRes) => {

        wrapperRes.filter.removed = false

        // wrapperRes.populates = [{ path: 'categories', select: 'values.title' }, { path: 'creator', select: 'name family fullname image username' }]

        useful.findQuery(data, res, extra, "series", wrapperRes, (docs, count, err) => {
            if (err) {
                console.log(err)
                security.sendSomethingWrong(res)
            } else {
                security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
            }
        })
    })
}

//! get special series
async function getSpecialSeries(data, res, extra) {
    console.log(data)
    let filter = { special: { $exists: true, $not: { $size: 0 } } }
    filter.removed = false
    filter.special = data.filter.type

    console.log(filter)

    if (data.lng != null) {
        filter['lng'] = data.lng
    }


    seriesModel.find(filter).lean().select({ body: 0 }).then((docs) => {

        security.sendResponse(res, { info: docs }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })
}


//! remove series
async function Removeseries(data, res, extra) {

    useful.removeQuery(data, res, extra, "series", () => {
        // security.sendResponse(res, { done: true }, 200, 'simpleJson')
    })

}


module.exports = myApiSwitcher
