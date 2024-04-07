
var wallpaper = require('../models/wallpaperModel');

var useful = require('../utils/useful');

var security = require('../security');

var apisList = {

    'wallpapers/getAll': { function: getAllWallpaper, security: null }, // REMOVE
    'wallpapers/getOneWallpaper': { function: getOneWallpaper, security: null }, // REMOVE
    'wallpapers/postWallpaper': { function: postWallpaper, security: null },
    'wallpapers/removeWallpaper': { function: removeWallpaper, security: null }, // REMOVE

};

function myApiSwitcher(data, res) {
    useful.apiSwitcher(data, res, apisList);
} ///////////////////// API Functions


function getOneWallpaper(data, res, extra) {
    let filter = data

    wallpaper.findOne(filter).lean().then((doc) => {

        security.sendResponse(res, { info: doc }, 200, 'simpleJson')

    }).catch(() => { security.sendSomethingWrong(res) })
}

function postWallpaper(data, res, extra) {
    let isNew = true
    if (data._id) {
        isNew = false
    }

    if (isNew) {
        let slug = useful.convertToSlug(data.values.title)
        data.values.slug = slug
        wallpaper.create({
            page: data.page,
            values: data.values,
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

        wallpaper.findOneAndUpdate({ _id: data._id }, {
            page: data.page,
            values: data.values,
            uDate: new Date(),
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

async function getAllWallpaper(data, res, extra) {


    useful.getWrapper(data, res, extra, (getWrapper) => {
  
      getWrapper.filter.removed = false
  
  
      useful.findQuery(data, res, extra, "wallpaper", getWrapper, (docs, count, err) => {
          if (err) {
              console.log(err)
              security.sendSomethingWrong(res)
          } else {
              security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
          }
      })
  
  
    })
  
  
}

// let content_filter = {};

// async function getAllWallpaper(data, res, extra) {


//     console.log(data)

//     useful.getWrapper(data, res, extra, (getWrapper) => {
//         content_filter = getWrapper;
//         console.log(getWrapper)
//     })

//     if (data.page != null) {
//         content_filter.page = data.page
//     }

//     if (data.lng != null) {
//         content_filter['values.lng'] = data.lng
//     }

//     content_filter.removed = false

//     console.log(content_filter)



//     wallpaper.find(content_filter.filter).lean().sort(content_filter.sort).limit(content_filter.limit).skip(content_filter.skip).then((docs) => {

//         console.log(docs)

//         if (data.getCount) {
//             wallpaper.find(content_filter).count().then((count) => {

//                 security.sendResponse(res, { info: docs, count }, 200, 'simpleJson')
//             })
//         } else {
//             security.sendResponse(res, { info: docs }, 200, 'simpleJson')
//         }

//         // security.sendResponse(res, { info: docs }, 200, 'simpleJson')

//     }).catch(() => { security.sendSomethingWrong(res) })


// }




function removeWallpaper(data, res, extra) {

    useful.removeQuery(data, res, extra, "wallpaper", () => { })

}

module.exports = myApiSwitcher;